import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * استرجاع حالة ظهور تابة وقسم العروض في التطبيق
 */
export const getOffersVisibility = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const res = await supabaseAdmin
      .from("ai_recommendation_access_state")
      .select("status,message")
      .eq("id", "offers_tab_visibility")
      .maybeSingle();

    if (res.data) {
      return { visible: res.data.status !== 0 };
    }
  } catch (err) {
    console.warn("Could not read offers visibility from database:", err);
  }
  return { visible: true };
});

/**
 * تبديل ظهور وإخفاء تابة العروض بالكامل (للإدارة فقط)
 */
export const toggleOffersVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ visible: z.boolean() }))
  .handler(async ({ context, data }) => {
    const roleCheck = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleCheck.error || !roleCheck.data) {
      throw new Error("هذه العملية متاحة لمديري التطبيق فقط");
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("ai_recommendation_access_state").upsert({
        id: "offers_tab_visibility",
        status: data.visible ? 1 : 0,
        message: data.visible ? "visible" : "hidden",
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Could not persist offers visibility in database:", err);
    }

    return { visible: data.visible };
  });
