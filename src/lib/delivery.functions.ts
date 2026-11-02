import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { driverInput } from "./delivery-rules";

const orderSelect = "id, status, total, subtotal, delivery_fee, address, phone, notes, area_id, created_at, picked_up_at, delivered_at, driver_id, order_items(name, qty, price), stores(name, phone, address, area_id)";

export const getDriverBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const me = await db.from("drivers").select("*").eq("user_id", context.userId).maybeSingle();
    if (me.error) throw new Error(me.error.message);
    if (!me.data || !me.data.is_active) return { driver: me.data, available: [], mine: [], areas: [] };
    const [available, mine, areas] = await Promise.all([
      db.from("orders").select(orderSelect).is("driver_id", null).eq("status", "preparing").order("created_at"),
      db.from("orders").select(orderSelect).eq("driver_id", context.userId).order("created_at", { ascending: false }).limit(200),
      db.from("areas").select("*"),
    ]);
    for (const r of [available, mine, areas]) if (r.error) throw new Error(r.error.message);
    return { driver: me.data, available: available.data ?? [], mine: mine.data ?? [], areas: areas.data ?? [] };
  });

export const claimOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const r = await context.supabase.rpc("driver_claim_order", { _order_id: data.id });
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const completeOrder = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ context, data }) => {
    const r = await context.supabase.rpc("driver_complete_order", { _order_id: data.id });
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

async function assertAdmin(db: any, userId: string) {
  const role = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (role.error || !role.data) throw new Error("هذه الصفحة مخصصة للإدارة فقط");
}

export const getDrivers = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    await assertAdmin(db, context.userId);
    const [drivers, orders] = await Promise.all([
      db.from("drivers").select("*").order("created_at", { ascending: false }),
      db.from("orders").select("driver_id, status, total, delivery_fee").not("driver_id", "is", null),
    ]);
    if (drivers.error) throw new Error(drivers.error.message);
    if (orders.error) throw new Error(orders.error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const users = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emails = new Map((users.data?.users ?? []).map(u => [u.id, u.email ?? ""]));
    return (drivers.data ?? []).map(d => {
      const list = (orders.data ?? []).filter(o => o.driver_id === d.user_id);
      const done = list.filter(o => o.status === "delivered");
      return { ...d, email: emails.get(d.user_id) ?? "", active: list.filter(o => o.status === "on_the_way").length, delivered: done.length, cash: done.reduce((s, o) => s + Number(o.total), 0) };
    });
  });

export const saveDriver = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(driverInput)
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const r = await context.supabase.rpc("admin_save_driver", { _email: data.email, _full_name: data.full_name, _phone: data.phone, _active: data.is_active });
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });

export const setDriverActive = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ user_id: z.string().uuid(), is_active: z.boolean() }))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const r = await supabaseAdmin.from("drivers").update({ is_active: data.is_active }).eq("user_id", data.user_id);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });
