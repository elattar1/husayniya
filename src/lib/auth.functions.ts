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
  fullName: z.string().trim().min(2, "يرجى كتابة الاسم بالكامل (حرفين على الأقل)"),
  phone: z.string().trim().min(8, "رقم التليفون يجب أن لا يقل عن 8 أرقام"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
  email: z.string().trim().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
});

const resolveInput = z.object({
  identifier: z.string().trim().min(2, "يرجى إدخال الاسم أو رقم التليفون أو البريد"),
});

const resetInput = z.object({
  identifier: z.string().trim().min(3, "يرجى إدخال رقم التليفون أو البريد الإلكتروني المسجل"),
  redirectUrl: z.string().optional(),
});

/** تسجيل حساب جديد برقم التليفون والاسم، والتحقق المسبق من عدم وجود مستخدم مسجل مسبقاً */
export const registerUserWithPhone = createServerFn({ method: "POST" })
  .validator((data: { fullName: string; phone: string; password: string; email?: string }) =>
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

    // 1. التحقق أولاً من عدم وجود مستخدم مسجل بنفس رقم التليفون في profiles
    try {
      const existingProfile = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existingProfile.data?.id) {
        return {
          success: false,
          alreadyExists: true,
          identifier: cleanPhone,
          message: "يوجد مستخدم بالفعل مسجل برقم الهاتف هذا",
        };
      }
    } catch (profErr) {
      console.warn("Could not check profiles for existing phone:", profErr);
    }

    // 2. التحقق من قائمة مستخدمي Auth من الهاتف أو البريد
    try {
      const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const users = list.data?.users ?? [];

      const phoneConflict = users.find(
        (u) =>
          u.email?.toLowerCase().trim() === systemEmail ||
          u.user_metadata?.phone === cleanPhone ||
          u.phone === cleanPhone
      );

      if (phoneConflict) {
        return {
          success: false,
          alreadyExists: true,
          identifier: cleanPhone,
          message: "يوجد مستخدم بالفعل مسجل برقم الهاتف هذا",
        };
      }

      if (recoveryEmail) {
        const emailConflict = users.find(
          (u) =>
            u.email?.toLowerCase().trim() === recoveryEmail ||
            u.user_metadata?.recovery_email?.toLowerCase().trim() === recoveryEmail
        );

        if (emailConflict) {
          return {
            success: false,
            alreadyExists: true,
            identifier: recoveryEmail,
            message: "يوجد مستخدم بالفعل مسجل بهذا البريد الإلكتروني",
          };
        }
      }
    } catch (authListErr) {
      console.warn("Could not check auth users list:", authListErr);
    }

    // 3. إنشاء الحساب الجديد مباشرة مع التفعيل الفوري
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: systemEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        phone: cleanPhone,
        recovery_email: recoveryEmail,
      },
    });

    const errorMsg = createError?.message?.toLowerCase() || "";
    if (
      createError &&
      (errorMsg.includes("already registered") ||
        errorMsg.includes("already been registered") ||
        errorMsg.includes("unique constraint") ||
        errorMsg.includes("exists"))
    ) {
      return {
        success: false,
        alreadyExists: true,
        identifier: cleanPhone,
        message: "يوجد مستخدم بالفعل مسجل بهذه البيانات",
      };
    }

    if (createError) {
      throw new Error(createError.message);
    }

    // 4. حفظ الاسم الكامل ورقم التليفون في جدول profiles
    if (newUser?.user?.id) {
      try {
        await supabaseAdmin.from("profiles").upsert({
          id: newUser.user.id,
          phone: cleanPhone,
          full_name: data.fullName,
        });
      } catch (pErr) {
        console.warn("Could not upsert profile row:", pErr);
      }
    }

    return {
      success: true,
      alreadyExists: false,
      authEmail: systemEmail,
      phone: cleanPhone,
    };
  });

/** تحويل الاسم أو رقم الهاتف أو البريد إلى البريد المعتمد لتسجيل الدخول */
export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .validator((data: { identifier: string }) => resolveInput.parse(data))
  .handler(async ({ data }) => {
    const raw = data.identifier.trim();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // أ) إذا كان المدخل بريداً إلكترونياً (يحوي @)
    if (raw.includes("@")) {
      const cleanEmail = raw.toLowerCase();
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

    // ب) إذا كان المدخل أرقاماً (رقم هاتف)
    const cleanPhone = normalizePhone(raw);
    const systemEmail = `${cleanPhone}@phone.husayniya.app`;

    if (cleanPhone.length >= 8) {
      // بحث في البروفايلات أولاً
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

      // بحث في قائمة Auth
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

      return { authEmail: systemEmail, phone: cleanPhone };
    }

    // ج) إذا كان المدخل اسماً (بحث بالاسم في جدول profiles)
    try {
      const prof = await supabaseAdmin
        .from("profiles")
        .select("id, phone")
        .ilike("full_name", `%${raw}%`)
        .limit(1)
        .maybeSingle();

      if (prof.data?.id) {
        const u = await supabaseAdmin.auth.admin.getUserById(prof.data.id);
        if (u.data?.user?.email) {
          return { authEmail: u.data.user.email, phone: prof.data.phone || null };
        }
      }
    } catch (e) {
      console.warn("Error searching profiles by name:", e);
    }

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
