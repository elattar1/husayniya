import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** تنظيف وتوحيد أرقام الهواتف (تحويل الأرقام العربية، إزالة المسافات، معالجة +20) */
export function normalizePhone(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.trim();
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  arabicDigits.forEach((d, idx) => {
    cleaned = cleaned.replaceAll(d, String(idx));
  });
  cleaned = cleaned.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+20")) cleaned = "0" + cleaned.slice(3);
  else if (cleaned.startsWith("0020")) cleaned = "0" + cleaned.slice(4);
  else if (cleaned.startsWith("20") && cleaned.length === 12) cleaned = "0" + cleaned.slice(2);
  return cleaned;
}

/** إخفاء البريد الإلكتروني لأغراض الخصوصية (e***r@gmail.com) */
export function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  if (name.length <= 2) return `${name[0]}*@${domain}`;
  return `${name[0]}***${name[name.length - 1]}@${domain}`;
}

const registerPhoneInput = z.object({
  phone: z.string().trim().min(8, "رقم التليفون يجب أن لا يقل عن 8 أرقام"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  fullName: z.string().trim().optional(),
});

const resolveInput = z.object({
  identifier: z.string().trim().min(3, "يرجى إدخال رقم التليفون أو البريد الإلكتروني"),
});

const resetInput = z.object({
  identifier: z.string().trim().min(3, "يرجى إدخال رقم التليفون أو البريد الإلكتروني المسجل"),
  redirectUrl: z.string().optional(),
});

/** تسجيل حساب جديد برقم التليفون، مع خيار إدخال بريد لاستعادة كلمة السر، وتفعيل فوري */
export const registerUserWithPhone = createServerFn({ method: "POST" })
  .validator((data: { phone: string; password: string; email?: string; fullName?: string }) =>
    registerPhoneInput.parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cleanPhone = normalizePhone(data.phone);
    if (cleanPhone.length < 10) {
      throw new Error("رقم الهاتف غير صحيح، يرجى كتابة رقم موبايل صحيح (مثال: 01012345678)");
    }

    const recoveryEmail = data.email?.trim().toLowerCase() || null;
    const systemEmail = `${cleanPhone}@phone.husayniya.app`;

    // 1. محاولة إنشاء الحساب مباشرة مع التفعيل الفوري
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: systemEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        phone: cleanPhone,
        recovery_email: recoveryEmail,
        full_name: data.fullName || `مستخدم ${cleanPhone.slice(-4)}`,
      },
    });

    let userId = newUser?.user?.id;

    // 2. إذا كان الرقم مسجلاً بالفعل، نقوم بتحديث كلمة المرور وتأكيد الحساب
    const errorMsg = createError?.message?.toLowerCase() || "";
    if (
      createError &&
      (errorMsg.includes("already registered") ||
        errorMsg.includes("already been registered") ||
        errorMsg.includes("unique constraint") ||
        errorMsg.includes("exists"))
    ) {
      try {
        const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existing = list.data?.users?.find(
          (u) =>
            u.email?.toLowerCase().trim() === systemEmail ||
            u.user_metadata?.phone === cleanPhone ||
            (recoveryEmail && u.user_metadata?.recovery_email === recoveryEmail)
        );
        if (existing) {
          userId = existing.id;
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password: data.password,
            email_confirm: true,
            user_metadata: {
              ...(existing.user_metadata || {}),
              phone: cleanPhone,
              recovery_email: recoveryEmail || existing.user_metadata?.recovery_email || null,
            },
          });
          if (updateError) throw updateError;
        }
      } catch (findErr: any) {
        console.error("Failed to update existing user:", findErr);
        throw new Error(findErr?.message || "هذا الرقم مسجل بالفعل، يرجى تسجيل الدخول");
      }
    } else if (createError) {
      throw new Error(createError.message);
    }

    // 3. تحديث جدول البروفايل بالهاتف والاسم
    if (userId) {
      try {
        await supabaseAdmin.from("profiles").upsert({
          id: userId,
          phone: cleanPhone,
          full_name: data.fullName || `مستخدم ${cleanPhone.slice(-4)}`,
        });
      } catch (pErr) {
        console.warn("Could not upsert profile row:", pErr);
      }
    }

    return {
      success: true,
      authEmail: systemEmail,
      phone: cleanPhone,
    };
  });

/** تحويل رقم الهاتف أو البريد إلى البريد المعتمد لتسجيل الدخول */
export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .validator((data: { identifier: string }) => resolveInput.parse(data))
  .handler(async ({ data }) => {
    const raw = data.identifier.trim();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // أ) إذا كان المدخل بريداً إلكترونياً
    if (raw.includes("@")) {
      const cleanEmail = raw.toLowerCase();
      // تحقق هل مسجل كبريد رئيسي أو كبريد استعادة لحساب هاتف
      const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const found = list.data?.users?.find(
        (u) =>
          u.email?.toLowerCase() === cleanEmail ||
          u.user_metadata?.recovery_email?.toLowerCase() === cleanEmail
      );
      if (found?.email) {
        return { authEmail: found.email, phone: found.user_metadata?.phone || null };
      }
      return { authEmail: cleanEmail, phone: null };
    }

    // ب) إذا كان المدخل رقم هاتف
    const cleanPhone = normalizePhone(raw);
    const systemEmail = `${cleanPhone}@phone.husayniya.app`;

    // 1. بحث في البروفايلات أولاً
    try {
      const prof = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (prof.data?.id) {
        const u = await supabaseAdmin.auth.admin.getUserById(prof.data.id);
        if (u.data?.user?.email) {
          return { authEmail: u.data.user.email, phone: cleanPhone };
        }
      }
    } catch (e) {
      console.warn("Error resolving profile by phone:", e);
    }

    // 2. بحث في قائمة مستخدمي Auth
    try {
      const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const found = list.data?.users?.find(
        (u) =>
          u.email?.toLowerCase() === systemEmail ||
          u.user_metadata?.phone === cleanPhone ||
          u.phone === cleanPhone
      );
      if (found?.email) {
        return { authEmail: found.email, phone: cleanPhone };
      }
    } catch (e) {
      console.warn("Error searching auth users by phone:", e);
    }

    // افتراضياً نستخدم البريد النظامي المقترن بالهاتف
    return { authEmail: systemEmail, phone: cleanPhone };
  });

/** طلب إعادة تعيين كلمة المرور عبر البريد الإلكتروني المسجل (سواء برقم الهاتف أو البريد) */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((data: { identifier: string; redirectUrl?: string }) => resetInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const raw = data.identifier.trim();
    let targetEmail = "";

    if (raw.includes("@")) {
      targetEmail = raw.toLowerCase();
    } else {
      const cleanPhone = normalizePhone(raw);
      // البحث عن بريد الاستعادة المرتبط بهذا الهاتف
      const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const found = list.data?.users?.find(
        (u) =>
          u.user_metadata?.phone === cleanPhone ||
          u.email?.startsWith(`${cleanPhone}@`) ||
          u.phone === cleanPhone
      );

      if (found) {
        const rec = found.user_metadata?.recovery_email;
        if (rec) {
          targetEmail = rec;
        } else if (found.email && !found.email.endsWith("@phone.husayniya.app")) {
          targetEmail = found.email;
        }
      }

      if (!targetEmail) {
        throw new Error(
          "لم يتم العثور على بريد إلكتروني لاستعادة كلمة المرور مسجل لهذا الرقم. يرجى التواصل مع إدارة التطبيق للمساعدة."
        );
      }
    }

    // إرسال رابط إعادة التعيين إلى البريد الإلكتروني
    try {
      const redirectUri = data.redirectUrl || "https://elattar1-husayniya.lovable.app/auth";
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: redirectUri,
      });
      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }

      return {
        success: true,
        maskedEmail: maskEmail(targetEmail),
        message: `تم إرسال رابط إعادة تعيين كلمة المرور بنجاح إلى بريدك: ${maskEmail(targetEmail)}`,
      };
    } catch (err: any) {
      console.error("Reset password failed:", err);
      throw new Error(err?.message || "تعذر إرسال رابط إعادة التعيين، يرجى المحاولة لاحقاً");
    }
  });

/** تفعيل فوري للحسابات القديمة غير المؤكدة دون انتظار كود */
export const autoConfirmUser = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => z.object({ email: z.string().trim() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cleanEmail = data.email.toLowerCase().trim();

    try {
      const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existing = list.data?.users?.find(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );
      if (!existing) {
        return { success: false, error: "المستخدم غير مسجل" };
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        email_confirm: true,
      });
      if (updateError) throw updateError;

      return { success: true, userId: existing.id };
    } catch (err: any) {
      console.error("Auto confirm user error:", err);
      return { success: false, error: err?.message || "تعذر تفعيل الحساب" };
    }
  });
