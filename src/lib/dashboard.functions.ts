import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  storeInput,
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
      REAL_STORES.forEach(s => storeMap.set(s.id, { ...s, owner_id: context.userId, created_at: new Date().toISOString() }));
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
    return {
      stores: mergedStores,
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
    const { id, ...values } = data;
    // Explicit ownership prevents an administrator using the provider screen to edit another store.
    const result = id
      ? await context.supabase
          .from("stores")
          .update(values)
          .eq("id", id)
          .eq("owner_id", context.userId)
          .select("id")
          .single()
      : await context.supabase
          .from("stores")
          .insert({ ...values, owner_id: context.userId })
          .select("id")
          .single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const saveSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(sectionInput)
  .handler(async ({ context, data }) => {
    const store = await context.supabase
      .from("stores")
      .select("id")
      .eq("id", data.store_id)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل أقسام هذا المتجر");
    const { id, store_id, ...values } = data;
    const result = id
      ? await context.supabase
          .from("store_sections")
          .update(values)
          .eq("id", id)
          .eq("store_id", store_id)
          .select("id")
          .single()
      : await context.supabase
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
    const store = await context.supabase
      .from("stores")
      .select("id,category")
      .eq("id", data.store_id)
      .eq("owner_id", context.userId)
      .maybeSingle();
    if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل أقسام هذا المتجر");
    const suggestions = suggestedSectionsFor(store.data.category);
    if (!suggestions.length) throw new Error("لا توجد أقسام مقترحة لهذا النوع من المتاجر");
    const result = await context.supabase.from("store_sections").upsert(
      suggestions.map((name, index) => ({ store_id: data.store_id, name, sort_order: (index + 1) * 10 })),
      { onConflict: "store_id,name", ignoreDuplicates: true },
    );
    if (result.error) throw new Error(result.error.message);
    return { success: true };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(productInput)
  .handler(async ({ context, data }) => {
    const store = await context.supabase
      .from("stores")
      .select("id")
      .eq("id", data.store_id)
      .eq("owner_id", context.userId)
      .single();
    if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل منتجات هذا المتجر");
    const { id, ...values } = data;
    const result = id
      ? await context.supabase
          .from("products")
          .update(values)
          .eq("id", id)
          .eq("store_id", data.store_id)
          .select("id")
          .single()
      : await context.supabase.from("products").insert(values).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), store_id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const store = await context.supabase
      .from("stores")
      .select("id")
      .eq("id", data.store_id)
      .eq("owner_id", context.userId)
      .single();
    if (store.error || !store.data) throw new Error("غير مسموح");
    const result = await context.supabase
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
    return result.data;
  });

export const importCatalogProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(catalogImportInput)
  .handler(async ({ context, data }) => {
    const store = await context.supabase
      .from("stores")
      .select("id,category")
      .eq("id", data.store_id)
      .eq("owner_id", context.userId)
      .single();
    if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل منتجات هذا المتجر");
    if (store.data.category !== "supermarkets") throw new Error("الكتالوج الجاهز متاح لمتاجر السوبر ماركت فقط");

    const items = data.items.map(input => {
      const item = catalogItem(input.key);
      if (!item) throw new Error("منتج غير موجود في الكتالوج");
      return { input, item };
    });
    const usedGroups = CATALOG_GROUPS.filter(group => items.some(({ item }) => item.group === group.key));
    const sectionSetup = await context.supabase.from("store_sections").upsert(
      usedGroups.map((group, index) => ({
        store_id: data.store_id,
        name: group.name,
        sort_order: (CATALOG_GROUPS.indexOf(group) + 1) * 10 + index * 0,
      })),
      { onConflict: "store_id,name", ignoreDuplicates: true },
    );
    if (sectionSetup.error) throw new Error(sectionSetup.error.message);
    const sections = await context.supabase
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
    const result = await context.supabase
      .from("products")
      .upsert(rows, { onConflict: "store_id,catalog_key" })
      .select("id");
    if (result.error) throw new Error(result.error.message);
    return { count: result.data?.length ?? 0 };
  });
