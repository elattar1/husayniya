import { z } from "zod";

export const driverInput = z.object({
  email: z.string().trim().email("البريد غير صحيح"),
  full_name: z.string().trim().min(2, "اكتب اسم الكابتن").max(80),
  phone: z.string().trim().regex(/^01[0125]\d{8}$/, "رقم موبايل مصري غير صحيح"),
  is_active: z.boolean(),
});

type DeliveredOrder = { status: string; delivery_fee: number | string; total: number | string; delivered_at: string | null };

/** Driver wallet: only delivered orders count; delivery fees are the captain's earnings, totals are cash to hand over. */
export function driverWallet(orders: DeliveredOrder[], now = new Date()) {
  const done = orders.filter(o => o.status === "delivered");
  const today = done.filter(o => o.delivered_at && new Date(o.delivered_at).toDateString() === now.toDateString());
  const sum = (list: DeliveredOrder[], key: "delivery_fee" | "total") => list.reduce((s, o) => s + Number(o[key] ?? 0), 0);
  return { deliveredCount: done.length, todayCount: today.length, earnings: sum(done, "delivery_fee"), todayEarnings: sum(today, "delivery_fee"), cashCollected: sum(done, "total") };
}
