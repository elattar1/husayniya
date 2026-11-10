import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const registerInput = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن لا تقل عن 6 أحرف"),
});

const emailInput = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صحيح"),
});

export const registerUserDirectly = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => registerInput.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cleanEmail = data.email.toLowerCase().trim();

    // 1. محاولة إنشاء المستخدم وتأكيد بريده فورياً بدون انتظار أي كود
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: data.password,
      email_confirm: true,
    });

    if (!createError && newUser?.user) {
      return { success: true, userId: newUser.user.id };
    }

    // 2. إذا كان الحساب موجوداً مسبقاً (مثلاً أنشئ ولم يؤكد بريده)، نفعله ونحدث كلمة المرور
    const errorMsg = createError?.message?.toLowerCase() || "";
    if (
      errorMsg.includes("already registered") ||
      errorMsg.includes("already been registered") ||
      errorMsg.includes("unique constraint") ||
      errorMsg.includes("exists")
    ) {
      try {
        const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existing = list.data?.users?.find(
          (u) => u.email?.toLowerCase().trim() === cleanEmail
        );
        if (existing) {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password: data.password,
            email_confirm: true,
          });
          if (updateError) throw updateError;
          return { success: true, userId: existing.id, updated: true };
        }
      } catch (findErr: any) {
        console.error("Failed to update existing unconfirmed user:", findErr);
        throw new Error(findErr?.message || "هذا البريد مسجل بالفعل، يرجى تسجيل الدخول بدلاً من ذلك.");
      }
    }

    if (createError) {
      throw new Error(createError.message);
    }

    return { success: true };
  });

export const autoConfirmUser = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => emailInput.parse(data))
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
