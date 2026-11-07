import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  storeInput,
  transferStoreOwnershipInput,
  productInput,
  sectionInput,
  commissionInput,
  requestKinds,
  allowedNext,
  catalogImportInput,
} from "./dashboard-rules";
import { CATALOG_GROUPS, catalogItem, catalogImage } from "./supermarket-catalog";
import { suggestedSectionsFor } from "./product-sections";
import { REAL_STORES, REAL_SECTIONS, REAL_PRODUCTS } from "./real-stores-data";

export const getDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ admin: z.boolean() }))
  .handler(async ({ context, data }) => {
    const db = context.supabase;
    if (data.admin) {
      const role = await db.rpc("has_role", { _user_id: context.userId, _role: "admin" });
      if (role.error || !role.data) throw new Error("هذه اللوحة مخصصة للإدارة فقط");
    }
    let storesQuery = db.from("stores").select("*").order("created_at", { ascending: false });
    if (!data.admin) storesQuery = storesQuery.eq("owner_id", context.userId);
    const stores = await storesQuery;
    if (stores.error) throw new Error(stores.error.message);
    
    // Filter out dummy demo stores and merge real stores for admin
    const rawStores = (stores.data ?? []).filter(s => !s.name.includes('(تجريبي)'));
    const storeMap = new Map();
    if (data.admin) {
      REAL_STORES.forEach(s => storeMap.set(s.id, { ...s, owner_id: null, created_at: new Date().toISOString() }));
    }
    rawStores.forEach(s => storeMap.set(s.id, s));
    const mergedStores = Array.from(storeMap.values());
    const ids = mergedStores.map(s => s.id);
    const [categories, areas, orders, bookings, services] = await Promise.all([
      db.from("categories").select("*").order("sort"),
      db.from("areas").select("*").order("id"),
      db.from("orders").select("*").in("store_id", ids).order("created_at", { ascending: false }),
      db.from("bookings").select("*").in("store_id", ids).order("created_at", { ascending: false }),
      db.from("service_requests").select("*").in("store_id", ids).order("created_at", { ascending: false }),
    ]);
    for (const result of [categories, areas, orders, bookings, services]) {
      if (result.error) throw new Error(result.error.message);
    }

    let userProfiles: { id: string; email: string; name: string }[] = [];
    const userEmailMap = new Map<string, string>();
    const userNameMap = new Map<string, string>();

    if (data.admin) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const [usersRes, profilesRes] = await Promise.all([
          supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
          supabaseAdmin.from("profiles").select("id, full_name, phone"),
        ]);
        const profilesMap = new Map((profilesRes.data ?? []).map((p: any) => [p.id, p.full_name]));

        const users = usersRes.data?.users ?? [];
        users.forEach((u: any) => {
          const profileName = profilesMap.get(u.id);
          const metaName = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || "";
          const name = profileName || metaName || (u.email ? u.email.split("@")[0] : "");
          if (u.email) {
            userEmailMap.set(u.id, u.email);
            userNameMap.set(u.id, name);
            userProfiles.push({ id: u.id, email: u.email, name });
          }
        });
      } catch (e) {
        console.error("Error fetching users for admin dashboard:", e);
      }
    }

    const enrichedStores = mergedStores.map(s => ({
      ...s,
      owner_email: s.owner_id ? (userEmailMap.get(s.owner_id) ?? null) : null,
      owner_name: s.owner_id ? (userNameMap.get(s.owner_id) ?? null) : null,
    }));

    return {
      stores: enrichedStores,
      registeredUsers: userProfiles,
      categories: categories.data ?? [],
      areas: areas.data ?? [],
      orders: orders.data ?? [],
      bookings: bookings.data ?? [],
      services: services.data ?? [],
    };
  });

export const getDashboardProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ storeId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;
    if (!isAdmin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", data.storeId)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية عرض منتجات هذا المتجر");
    }
    const result = await context.supabase
      .from("products")
      .select("*")
      .eq("store_id", data.storeId)
      .order("created_at", { ascending: false });
    if (result.error) throw new Error(result.error.message);
    const dbProds = result.data ?? [];
    if (dbProds.length > 0) return dbProds;
    return REAL_PRODUCTS.filter(p => p.store_id === data.storeId) as any;
  });

export const getDashboardSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ storeId: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;
    if (!isAdmin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", data.storeId)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية عرض أقسام هذا المتجر");
    }
    const result = await context.supabase
      .from("store_sections")
      .select("id,store_id,name,sort_order,created_at")
      .eq("store_id", data.storeId)
      .order("sort_order")
      .order("name");
    if (result.error) throw new Error(result.error.message);
    const dbSecs = result.data ?? [];
    if (dbSecs.length > 0) return dbSecs;
    return REAL_SECTIONS.filter(s => s.store_id === data.storeId) as any;
  });

export const getDashboardOrderItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ orderId: z.string().uuid(), admin: z.boolean() }))
  .handler(async ({ context, data }) => {
    if (data.admin) {
      const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
      if (role.error || !role.data) throw new Error("هذه العملية مخصصة للإدارة فقط");
    }
    const order = await context.supabase.from("orders").select("store_id").eq("id", data.orderId).single();
    if (order.error || !order.data) throw new Error("الطلب غير موجود");
    if (!data.admin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", order.data.store_id)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية عرض هذا الطلب");
    }
    const items = await context.supabase.from("order_items").select("name,qty,price").eq("order_id", data.orderId);
    if (items.error) throw new Error(items.error.message);
    return items.data ?? [];
  });

export const saveStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(storeInput)
  .handler(async ({ context, data }) => {
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;
    const { id, owner_email, ...values } = data;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let targetOwnerId: string | null = context.userId;

    if (isAdmin && owner_email !== undefined) {
      const trimmed = owner_email.trim().toLowerCase();
      if (trimmed === "") {
        targetOwnerId = null;
      } else {
        const usersRes = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const targetUser = (usersRes.data?.users ?? []).find(
          (u: any) => (u.email ?? "").toLowerCase() === trimmed
        );
        if (!targetUser) {
          throw new Error(`لم يتم العثور على أي حساب مسجل بالبريد: ${owner_email}`);
        }
        targetOwnerId = targetUser.id;
        const roleCheckTarget = await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", targetUser.id)
          .eq("role", "provider")
          .maybeSingle();
        if (!roleCheckTarget.data) {
          await supabaseAdmin.from("user_roles").insert({
            user_id: targetUser.id,
            role: "provider",
          });
        }
      }
    }

    if (id) {
      let query = supabaseAdmin.from("stores").update(
        isAdmin && owner_email !== undefined ? { ...values, owner_id: targetOwnerId } : values
      ).eq("id", id);
      if (!isAdmin) {
        query = query.eq("owner_id", context.userId);
      }
      const result = await query.select("id").single();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    } else {
      const result = await supabaseAdmin.from("stores").insert({
        ...values,
        owner_id: isAdmin ? targetOwnerId : context.userId,
      }).select("id").single();
      if (result.error) throw new Error(result.error.message);
      return result.data;
    }
  });

export const saveSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(sectionInput)
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;

    if (!isAdmin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", data.store_id)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل أقسام هذا المتجر");
    }

    const dbClient = isAdmin ? supabaseAdmin : context.supabase;
    const { id, store_id, ...values } = data;
    const result = id
      ? await dbClient
          .from("store_sections")
          .update(values)
          .eq("id", id)
          .eq("store_id", store_id)
          .select("id")
          .single()
      : await dbClient
          .from("store_sections")
          .insert({ ...values, store_id })
          .select("id")
          .single();
    if (result.error) {
      if (result.error.code === "23505") throw new Error("هذا القسم موجود بالفعل");
      throw new Error(result.error.message);
    }
    return result.data;
  });

export const addSuggestedSections = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ store_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;

    let storeCategory = "";
    if (isAdmin) {
      const s = await supabaseAdmin.from("stores").select("category").eq("id", data.store_id).maybeSingle();
      storeCategory = s.data?.category || "";
    } else {
      const store = await context.supabase
        .from("stores")
        .select("id,category")
        .eq("id", data.store_id)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل أقسام هذا المتجر");
      storeCategory = store.data.category;
    }

    const suggestions = suggestedSectionsFor(storeCategory);
    if (!suggestions.length) throw new Error("لا توجد أقسام مقترحة لهذا النوع من المتاجر");
    const dbClient = isAdmin ? supabaseAdmin : context.supabase;
    const result = await dbClient.from("store_sections").upsert(
      suggestions.map((name, index) => ({ store_id: data.store_id, name, sort_order: (index + 1) * 10 })),
      { onConflict: "store_id,name", ignoreDuplicates: true },
    );
    if (result.error) throw new Error(result.error.message);
    return { success: true };
  });

export const deleteSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), store_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;

    if (!isAdmin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", data.store_id)
        .eq("owner_id", context.userId)
        .maybeSingle();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية حذف أقسام هذا المتجر");
    }

    const dbClient = isAdmin ? supabaseAdmin : context.supabase;
    // Unassign products from this section first so products remain safe
    await dbClient
      .from("products")
      .update({ section_id: null })
      .eq("section_id", data.id)
      .eq("store_id", data.store_id);

    const res = await dbClient
      .from("store_sections")
      .delete()
      .eq("id", data.id)
      .eq("store_id", data.store_id);

    if (res.error) throw new Error(res.error.message);
    return { ok: true };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(productInput)
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;

    if (!isAdmin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", data.store_id)
        .eq("owner_id", context.userId)
        .single();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل منتجات هذا المتجر");
    }

    const dbClient = isAdmin ? supabaseAdmin : context.supabase;
    const { id, ...values } = data;
    const result = id
      ? await dbClient
          .from("products")
          .update(values)
          .eq("id", id)
          .eq("store_id", data.store_id)
          .select("id")
          .single()
      : await dbClient.from("products").insert(values).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), store_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;

    if (!isAdmin) {
      const store = await context.supabase
        .from("stores")
        .select("id")
        .eq("id", data.store_id)
        .eq("owner_id", context.userId)
        .single();
      if (store.error || !store.data) throw new Error("غير مسموح");
    }

    const dbClient = isAdmin ? supabaseAdmin : context.supabase;
    const result = await dbClient
      .from("products")
      .delete()
      .eq("id", data.id)
      .eq("store_id", data.store_id)
      .select("id")
      .single();
    if (result.error) throw new Error(result.error.message);
    return { success: true };
  });

export const approveStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(commissionInput)
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || !role.data) throw new Error("هذه العملية مخصصة للإدارة فقط");
    const result = await context.supabase
      .from("stores")
      .update({ commission_rate: data.commission_rate, is_active: data.is_active })
      .eq("id", data.id)
      .select("id")
      .single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const transferStoreOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(transferStoreOwnershipInput)
  .handler(async ({ context, data }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || !role.data) throw new Error("هذه العملية مخصصة للإدارة فقط");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Case 1: Unassign ownership (make store public / unclaimed)
    if (data.unassign) {
      const existing = await supabaseAdmin.from("stores").select("id").eq("id", data.store_id).maybeSingle();
      if (existing.data) {
        const updateRes = await supabaseAdmin.from("stores").update({ owner_id: null }).eq("id", data.store_id);
        if (updateRes.error) throw new Error(updateRes.error.message);
      }
      return { success: true, store_id: data.store_id, owner_email: null, message: "تم إلغاء تعيين المالك" };
    }

    // Case 2: Assign ownership by email
    const trimmedEmail = (data.email ?? "").trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      throw new Error("يرجى إدخال بريد إلكتروني صحيح للمستخدم");
    }

    const usersRes = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const targetUser = (usersRes.data?.users ?? []).find(
      (u: any) => (u.email ?? "").toLowerCase() === trimmedEmail
    );

    if (!targetUser) {
      throw new Error(`لم يتم العثور على أي حساب مسجل بالبريد: ${trimmedEmail}. تأكد من تسجيل المستخدم في الموقع أولاً.`);
    }

    // Check if store exists in DB
    const existing = await supabaseAdmin.from("stores").select("id").eq("id", data.store_id).maybeSingle();

    if (!existing.data) {
      // Store is in curated REAL_STORES
      const staticStore = REAL_STORES.find(s => s.id === data.store_id);
      if (!staticStore) throw new Error("المتجر أو الخدمة المطلوبة غير موجودة");

      const insertStoreRes = await supabaseAdmin.from("stores").insert({
        id: staticStore.id,
        name: staticStore.name,
        category: staticStore.category,
        area_id: staticStore.area_id,
        description: staticStore.description,
        phone: staticStore.phone,
        address: staticStore.address,
        specialty: staticStore.specialty ?? null,
        delivery_fee: staticStore.delivery_fee,
        booking_fee: staticStore.booking_fee,
        commission_rate: staticStore.commission_rate,
        is_active: true,
        is_open: staticStore.is_open,
        logo_url: staticStore.logo_url,
        banner_url: staticStore.banner_url,
        owner_id: targetUser.id,
      });
      if (insertStoreRes.error) throw new Error(insertStoreRes.error.message);

      // Seed sections and products from static data so new owner can manage them
      const storeSections = REAL_SECTIONS.filter(sec => sec.store_id === staticStore.id);
      if (storeSections.length > 0) {
        await supabaseAdmin.from("store_sections").upsert(storeSections, { onConflict: "id", ignoreDuplicates: true });
      }
      const storeProducts = REAL_PRODUCTS.filter(p => p.store_id === staticStore.id);
      if (storeProducts.length > 0) {
        await supabaseAdmin.from("products").upsert(storeProducts, { onConflict: "id", ignoreDuplicates: true });
      }
    } else {
      // Update existing DB store
      const updateRes = await supabaseAdmin
        .from("stores")
        .update({ owner_id: targetUser.id, is_active: true })
        .eq("id", data.store_id);
      if (updateRes.error) throw new Error(updateRes.error.message);
    }

    // Ensure target user has 'provider' role in user_roles
    const roleCheckTarget = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", targetUser.id)
      .eq("role", "provider")
      .maybeSingle();

    if (!roleCheckTarget.data) {
      await supabaseAdmin.from("user_roles").insert({
        user_id: targetUser.id,
        role: "provider",
      });
    }

    return {
      success: true,
      store_id: data.store_id,
      owner_id: targetUser.id,
      owner_email: targetUser.email,
    };
  });

export const updateRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      kind: z.enum(requestKinds),
      id: z.string().uuid(),
      status: z.string(),
      quoted_price: z.number().min(0).optional(),
    }),
  )
  .handler(async ({ context, data }) => {
    const existing = await context.supabase.from(data.kind).select("store_id,status").eq("id", data.id).single();
    if (existing.error || !existing.data) throw new Error("الطلب غير موجود");
    const [owner, admin] = await Promise.all([
      context.supabase.rpc("is_store_owner", { _store_id: existing.data.store_id }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if ((!owner.data && !admin.data) || owner.error || admin.error) {
      throw new Error("لا تملك صلاحية إدارة هذا الطلب");
    }
    if (!allowedNext(data.kind, existing.data.status).includes(data.status)) {
      throw new Error("لا يمكن الانتقال إلى هذه الحالة");
    }
    if (data.kind === "service_requests" && data.status === "completed" && data.quoted_price === undefined) {
      throw new Error("أدخل السعر النهائي للخدمة");
    }
    const result =
      data.kind === "service_requests"
        ? await context.supabase
            .from("service_requests")
            .update({
              status: data.status,
              ...(data.quoted_price !== undefined ? { quoted_price: data.quoted_price } : {}),
            })
            .eq("id", data.id)
            .eq("status", existing.data.status)
            .select("id")
            .single()
        : data.kind === "orders"
          ? await context.supabase
              .from("orders")
              .update({
                status: data.status,
                ...(data.status === "on_the_way" ? { picked_up_at: new Date().toISOString() } : {}),
                ...(data.status === "delivered" ? { payment_status: "paid_cash" } : {}),
              })
              .eq("id", data.id)
              .eq("status", existing.data.status)
              .select("id")
              .single()
          : await context.supabase
              .from("bookings")
              .update({ status: data.status })
              .eq("id", data.id)
              .eq("status", existing.data.status)
              .select("id")
              .single();
    if (result.error) throw new Error(result.error.message);

    if (data.kind === "orders") {
      try {
        const { notifyOrderStatusUpdate } = await import("@/lib/chat.functions");
        await notifyOrderStatusUpdate(data.id, data.status);
      } catch (e) {
        console.error("notifyOrderStatusUpdate failed:", e);
      }
    }

    return result.data;
  });

export const importCatalogProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(catalogImportInput)
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const roleCheck = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    const isAdmin = !!roleCheck.data;

    let storeCategory = "";
    if (isAdmin) {
      const s = await supabaseAdmin.from("stores").select("category").eq("id", data.store_id).maybeSingle();
      storeCategory = s.data?.category || "";
    } else {
      const store = await context.supabase
        .from("stores")
        .select("id,category")
        .eq("id", data.store_id)
        .eq("owner_id", context.userId)
        .single();
      if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل منتجات هذا المتجر");
      storeCategory = store.data.category;
    }

    if (storeCategory !== "supermarkets") throw new Error("الكتالوج الجاهز متاح لمتاجر السوبر ماركت فقط");

    const dbClient = isAdmin ? supabaseAdmin : context.supabase;

    const items = data.items.map(input => {
      const item = catalogItem(input.key);
      if (!item) throw new Error("منتج غير موجود في الكتالوج");
      return { input, item };
    });
    const usedGroups = CATALOG_GROUPS.filter(group => items.some(({ item }) => item.group === group.key));
    const sectionSetup = await dbClient.from("store_sections").upsert(
      usedGroups.map((group, index) => ({
        store_id: data.store_id,
        name: group.name,
        sort_order: (CATALOG_GROUPS.indexOf(group) + 1) * 10 + index * 0,
      })),
      { onConflict: "store_id,name", ignoreDuplicates: true },
    );
    if (sectionSetup.error) throw new Error(sectionSetup.error.message);
    const sections = await dbClient
      .from("store_sections")
      .select("id,name")
      .eq("store_id", data.store_id);
    if (sections.error) throw new Error(sections.error.message);

    const rows = items.map(({ input, item }) => {
      const group = CATALOG_GROUPS.find(candidate => candidate.key === item.group);
      return {
        store_id: data.store_id,
        catalog_key: item.key,
        name: item.name,
        description: item.size,
        image_url: catalogImage(item.group),
        section_id: sections.data.find(section => section.name === group?.name)?.id ?? null,
        price: input.price,
        stock_qty: input.stock_qty,
        is_available: input.stock_qty !== 0,
      };
    });
    const result = await dbClient
      .from("products")
      .upsert(rows, { onConflict: "store_id,catalog_key" })
      .select("id");
    if (result.error) throw new Error(result.error.message);
    return { count: result.data?.length ?? 0 };
  });
