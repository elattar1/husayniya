import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

/** حساب وتنسيق المدة المتبقية بالعربية للحذف النهائي */
export function formatRemainingTime(scheduledIso: string): string {
  const diff = new Date(scheduledIso).getTime() - Date.now();
  if (diff <= 0) return "انتهت مهلة الـ 7 أيام";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} ${days === 1 ? "يوم" : days === 2 ? "يومان" : "أيام"} و ${hours} ساعة`;
  }
  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  }
  return `${minutes} دقيقة`;
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

const deletionRequestInput = z.object({
  method: z.enum(["password", "code", "google_confirm"]),
  password: z.string().optional(),
  code: z.string().optional(),
});

/** تسجيل حساب جديد برقم التليفون والاسم، والتحقق المسبق من عدم وجود مستخدم مسجل مسبقاً (خاصة عبر Google) */
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
          message: "يوجد مستخدم بالفعل مسجل برقم الهاتف هذا، يرجى تسجيل الدخول.",
        };
      }
    } catch (profErr) {
      console.warn("Could not check profiles for existing phone:", profErr);
    }

    // 2. التحقق من قائمة مستخدمي Auth ومنع التسجيل بأي بريد مسجل مسبقاً بواسطة Google أو غيرها
    try {
      const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const users = list.data?.users ?? [];

      // أ) التحقق من الهاتف
      const phoneConflict = users.find(
        (u) =>
          u.email?.toLowerCase().trim() === systemEmail ||
          u.user_metadata?.phone === cleanPhone ||
          u.phone === cleanPhone
      );

      if (phoneConflict) {
        const isGoogle =
          phoneConflict.app_metadata?.provider === "google" ||
          phoneConflict.app_metadata?.providers?.includes("google") ||
          phoneConflict.identities?.some((id: any) => id.provider === "google");

        return {
          success: false,
          alreadyExists: true,
          isGoogle,
          identifier: cleanPhone,
          message: isGoogle
            ? "هذا الرقم مرتبط بحساب مسجل عبر Google، يرجى تسجيل الدخول عبر زر Google."
            : "يوجد مستخدم بالفعل مسجل برقم الهاتف هذا، يرجى تسجيل الدخول.",
        };
      }

      // ب) التحقق الصارم من البريد الإلكتروني: رفض أي بريد مسجل من خلال Google
      if (recoveryEmail) {
        const emailConflict = users.find(
          (u) =>
            u.email?.toLowerCase().trim() === recoveryEmail ||
            u.user_metadata?.recovery_email?.toLowerCase().trim() === recoveryEmail
        );

        if (emailConflict) {
          const isGoogle =
            emailConflict.app_metadata?.provider === "google" ||
            emailConflict.app_metadata?.providers?.includes("google") ||
            emailConflict.identities?.some((id: any) => id.provider === "google");

          if (isGoogle) {
            return {
              success: false,
              alreadyExists: true,
              isGoogle: true,
              identifier: recoveryEmail,
              message:
                "هذا البريد الإلكتروني مسجل بالفعل بواسطة حساب Google، ولا يمكن إنشاء حساب عادي به. يرجى تسجيل الدخول باستخدام Google مباشرة.",
            };
          }

          return {
            success: false,
            alreadyExists: true,
            isGoogle: false,
            identifier: recoveryEmail,
            message: "يوجد مستخدم بالفعل مسجل بهذا البريد الإلكتروني، يرجى تسجيل الدخول بدلاً من ذلك.",
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
        message: "يوجد مستخدم بالفعل مسجل بهذه البيانات، يرجى تسجيل الدخول.",
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

/** إرسال كود تحقق عبر البريد الإلكتروني لتأكيد طلب حذف الحساب */
export const sendDeletionVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userRes = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const user = userRes.data?.user;
    if (!user) throw new Error("تعذر تحديد المستخدم المسجل");

    let targetEmail = user.user_metadata?.recovery_email;
    if (!targetEmail && user.email && !user.email.endsWith("@phone.husayniya.app")) {
      targetEmail = user.email;
    }

    if (!targetEmail) {
      throw new Error("لا يوجد بريد إلكتروني مسجل في حسابك لإرسال الكود. يرجى التأكيد باستخدام كلمة المرور.");
    }

    // إنشاء كود سداسي عشوائي وصلاحية 15 دقيقة
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      user_metadata: {
        ...(user.user_metadata || {}),
        deletion_code: code,
        deletion_code_expires_at: expiresAt,
      },
    });

    // إرسال إشعار في التطبيق بكود التحقق لضمان الوصول الفوري
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: context.userId,
        title: "كود تأكيد طلب حذف الحساب",
        body: `كود التحقق الخاص بطلب حذف الحساب هو: ${code}. ينتهي خلال 15 دقيقة. إذا لم تكن أنت، يرجى تجاهل الرسالة.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    } catch (nErr) {
      console.warn("Could not create in-app notification for code:", nErr);
    }

    // محاولة إرسال كود الـ OTP عبر البريد الرسمي أيضاً
    try {
      await context.supabase.auth.signInWithOtp({ email: targetEmail });
    } catch (otpErr) {
      console.warn("OTP email sending notice:", otpErr);
    }

    return {
      success: true,
      maskedEmail: maskEmail(targetEmail),
      message: `تم إرسال كود التحقق المكون من 6 أرقام إلى بريدك: ${maskEmail(targetEmail)} وتنبيهاتك.`,
    };
  });

/** جدولة حذف الحساب لمدة 7 أيام بعد التحقق بكلمة المرور أو كود الإيميل */
export const requestAccountDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { method: "password" | "code" | "google_confirm"; password?: string; code?: string }) =>
    deletionRequestInput.parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userRes = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const user = userRes.data?.user;
    if (!user) throw new Error("تعذر تحديد بيانات المستخدم");

    // 1. التحقق حسب الطريقة المختارة
    if (data.method === "password") {
      if (!data.password?.trim()) {
        throw new Error("يرجى كتابة كلمة المرور الحالية لتأكيد الحذف");
      }
      // التحقق من صحة كلمة المرور عبر محاولة المصادقة
      const checkAuth = await context.supabase.auth.signInWithPassword({
        email: user.email!,
        password: data.password.trim(),
      });
      if (checkAuth.error) {
        throw new Error("كلمة المرور المدخلة غير صحيحة، يرجى التأكد والمحاولة مجدداً");
      }
    } else if (data.method === "code") {
      if (!data.code?.trim()) {
        throw new Error("يرجى إدخال كود التحقق المكون من 6 أرقام");
      }
      const storedCode = user.user_metadata?.deletion_code;
      const expiresAt = user.user_metadata?.deletion_code_expires_at;

      if (!storedCode || !expiresAt) {
        throw new Error("لم يتم طلب كود تحقق بعد أو انتهت صلاحيته. يرجى طلب كود جديد.");
      }
      if (new Date(expiresAt).getTime() < Date.now()) {
        throw new Error("انتهت صلاحية كود التحقق، يرجى طلب كود جديد.");
      }
      if (storedCode.trim() !== data.code.trim()) {
        throw new Error("كود التحقق غير صحيح، يرجى التأكد من الرمز المدخل.");
      }
    } else if (data.method === "google_confirm") {
      const isGoogle =
        user.app_metadata?.provider === "google" ||
        user.app_metadata?.providers?.includes("google") ||
        user.identities?.some((id: any) => id.provider === "google");
      if (!isGoogle) {
        throw new Error("يرجى تأكيد الحذف بكلمة المرور أو كود البريد");
      }
    }

    // 2. جدولة الحذف لمدة 7 أيام بدءاً من الآن
    const now = new Date();
    const scheduledAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      user_metadata: {
        ...(user.user_metadata || {}),
        deletion_status: "pending",
        deletion_requested_at: now.toISOString(),
        scheduled_deletion_at: scheduledAt.toISOString(),
        deletion_code: null,
        deletion_code_expires_at: null,
      },
    });

    return {
      success: true,
      deletionRequestedAt: now.toISOString(),
      scheduledDeletionAt: scheduledAt.toISOString(),
      message: "تم تقديم طلب حذف حسابك بنجاح. سيتم حذف حسابك نهائياً خلال 7 أيام إذا لم تقم بتسجيل الدخول مجدداً.",
    };
  });

/** إعادة تنشيط الحساب وإلغاء طلب الحذف الجاري */
export const reactivateAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userRes = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const user = userRes.data?.user;
    if (!user) throw new Error("تعذر تحديد بيانات المستخدم");

    const newMetadata = { ...(user.user_metadata || {}) };
    delete newMetadata.deletion_status;
    delete newMetadata.deletion_requested_at;
    delete newMetadata.scheduled_deletion_at;
    delete newMetadata.deletion_code;
    delete newMetadata.deletion_code_expires_at;

    await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      user_metadata: newMetadata,
    });

    return {
      success: true,
      message: "تم إلغاء طلب الحذف وإعادة تنشيط حسابك بنجاح! يسعدنا استمرارك معنا في خدمات الحسينية.",
    };
  });

/** فحص حالة الحذف ومسحه نهائياً بعد مرور الـ 7 أيام */
export const checkAndPurgeAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userRes = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const user = userRes.data?.user;
    if (!user) return { status: "none" };

    const status = user.user_metadata?.deletion_status;
    const scheduledAt = user.user_metadata?.scheduled_deletion_at;

    if (status === "pending" && scheduledAt) {
      const scheduledTime = new Date(scheduledAt).getTime();
      const now = Date.now();

      // إذا انقضت الـ 7 أيام كاملة -> مسح الحساب نهائياً
      if (now >= scheduledTime) {
        try {
          await supabaseAdmin.from("profiles").delete().eq("id", context.userId);
          await supabaseAdmin.from("customer_addresses").delete().eq("user_id", context.userId);
          await supabaseAdmin.auth.admin.deleteUser(context.userId);
        } catch (delErr) {
          console.error("Purge user error:", delErr);
        }
        return {
          status: "purged",
          message: "تم حذف حسابك نهائياً بعد انتهاء مهلة الـ 7 أيام.",
        };
      }

      // الحساب لا يزال في مهلة الـ 7 أيام
      return {
        status: "pending",
        requestedAt: user.user_metadata?.deletion_requested_at,
        scheduledAt: scheduledAt,
        remainingTime: formatRemainingTime(scheduledAt),
      };
    }

    return { status: "active" };
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
