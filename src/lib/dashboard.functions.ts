import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { storeInput, productInput, commissionInput, requestKinds, allowedNext } from "./dashboard-rules";

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
    const ids = (stores.data ?? []).map(s => s.id);
    const [categories, areas, products, orders, bookings, services] = await Promise.all([
      db.from("categories").select("*").order("sort"), db.from("areas").select("*").order("id"),
      db.from("products").select("*").in("store_id", ids).order("created_at", { ascending: false }),
      db.from("orders").select("*, order_items(*)").in("store_id", ids).order("created_at", { ascending: false }),
      db.from("bookings").select("*").in("store_id", ids).order("created_at", { ascending: false }),
      db.from("service_requests").select("*").in("store_id", ids).order("created_at", { ascending: false }),
    ]);
    for (const result of [categories, areas, products, orders, bookings, services]) if (result.error) throw new Error(result.error.message);
    return { stores: stores.data ?? [], categories: categories.data ?? [], areas: areas.data ?? [], products: products.data ?? [], orders: orders.data ?? [], bookings: bookings.data ?? [], services: services.data ?? [] };
  });

export const saveStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(storeInput).handler(async ({ context, data }) => {
    const { id, ...values } = data;
    // Explicit ownership prevents an administrator using the provider screen to edit another store.
    const result = id
      ? await context.supabase.from("stores").update(values).eq("id", id).eq("owner_id", context.userId).select("id").single()
      : await context.supabase.from("stores").insert({ ...values, owner_id: context.userId }).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const saveProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(productInput).handler(async ({ context, data }) => {
    const store = await context.supabase.from("stores").select("id").eq("id", data.store_id).eq("owner_id", context.userId).single();
    if (store.error || !store.data) throw new Error("لا تملك صلاحية تعديل منتجات هذا المتجر");
    const { id, ...values } = data;
    const result = id
      ? await context.supabase.from("products").update(values).eq("id", id).eq("store_id", data.store_id).select("id").single()
      : await context.supabase.from("products").insert(values).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const deleteProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), store_id: z.string().uuid() })).handler(async ({ context, data }) => {
    const store = await context.supabase.from("stores").select("id").eq("id", data.store_id).eq("owner_id", context.userId).single();
    if (store.error || !store.data) throw new Error("غير مسموح");
    const result = await context.supabase.from("products").delete().eq("id", data.id).eq("store_id", data.store_id).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return { success: true };
  });

export const approveStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(commissionInput).handler(async ({ context, data }) => {
    const role = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (role.error || !role.data) throw new Error("هذه العملية مخصصة للإدارة فقط");
    const result = await context.supabase.from("stores").update({ commission_rate: data.commission_rate, is_active: data.is_active }).eq("id", data.id).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });

export const updateRequest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ kind: z.enum(requestKinds), id: z.string().uuid(), status: z.string(), quoted_price: z.number().min(0).optional() }))
  .handler(async ({ context, data }) => {
    const existing = await context.supabase.from(data.kind).select("store_id,status").eq("id", data.id).single();
    if (existing.error || !existing.data) throw new Error("الطلب غير موجود");
    const [owner, admin] = await Promise.all([
      context.supabase.rpc("is_store_owner", { _store_id: existing.data.store_id }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if ((!owner.data && !admin.data) || owner.error || admin.error) throw new Error("لا تملك صلاحية إدارة هذا الطلب");
    if (!allowedNext(data.kind, existing.data.status).includes(data.status)) throw new Error("لا يمكن الانتقال إلى هذه الحالة");
    if (data.kind === "service_requests" && data.status === "completed" && data.quoted_price === undefined) throw new Error("أدخل السعر النهائي للخدمة");
    const values = data.kind === "service_requests"
      ? { status: data.status, ...(data.quoted_price !== undefined ? { quoted_price: data.quoted_price } : {}) }
      : data.kind === "orders" && data.status === "delivered" ? { status: data.status, payment_status: "paid_cash" } : { status: data.status };
    const result = await context.supabase.from(data.kind).update(values).eq("id", data.id).eq("status", existing.data.status).select("id").single();
    if (result.error) throw new Error(result.error.message);
    return result.data;
  });