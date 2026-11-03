import { z } from "zod";

export const storeInput = z.object({
  id: z.string().uuid().optional(), name: z.string().trim().min(2).max(120),
  category: z.string().min(1), area_id: z.coerce.number().int().positive().nullable(),
  description: z.string().max(2000), phone: z.string().trim().min(6).max(25),
  address: z.string().trim().min(3).max(500), specialty: z.string().max(200),
  delivery_fee: z.coerce.number().min(0), booking_fee: z.coerce.number().min(0), is_open: z.boolean(),
  logo_url: z.string().trim().max(2000).refine(v => v === "" || v.startsWith("https://") || /^\/catalog\/[a-z]+\.jpg$/.test(v)).transform(v => v || null), banner_url: z.string().trim().max(2000).refine(v => v === "" || v.startsWith("https://") || /^\/catalog\/[a-z]+\.jpg$/.test(v)).transform(v => v || null),
});
export const productInput = z.object({
  id: z.string().uuid().optional(), store_id: z.string().uuid(), name: z.string().trim().min(2).max(160),
  description: z.string().max(2000), price: z.coerce.number().min(0), is_available: z.boolean(),
  image_url: z.string().trim().max(2000).refine(v => v === "" || v.startsWith("https://") || /^\/catalog\/[a-z]+\.jpg$/.test(v)).transform(v => v || null), stock_qty: z.coerce.number().int().min(0).nullable(),
});
export const commissionInput = z.object({ id: z.string().uuid(), commission_rate: z.coerce.number().min(0).max(100), is_active: z.boolean() });
export const requestKinds = ["orders", "bookings", "service_requests"] as const;
export type RequestKind = typeof requestKinds[number];
export const flows: Record<RequestKind, string[]> = {
  orders: ["pending", "accepted", "preparing", "on_the_way", "delivered"],
  bookings: ["pending", "confirmed", "completed"],
  service_requests: ["pending", "accepted", "in_progress", "completed"],
};
export function allowedNext(kind: RequestKind, current: string) {
  // Stores stop at "preparing" (ready); only the delivery captain moves orders on the way and delivered.
  if (kind === "orders" && !["pending", "accepted"].includes(current)) return [];
  const flow = flows[kind];
  const index = flow.indexOf(current);
  if (index < 0 || index === flow.length - 1) return [];
  return [flow[index + 1], "cancelled"];
}
export type LedgerRow = { kind: RequestKind; status: string; amount: number; commission: number; created_at: string; store_id: string };
export function earnings(rows: LedgerRow[]) {
  return rows.reduce((sum, row) => {
    const complete = row.kind === "orders" ? row.status === "delivered" : row.status === "completed";
    if (!complete) return sum;
    return { gross: sum.gross + row.amount, commission: sum.commission + row.commission, net: sum.net + row.amount - row.commission, count: sum.count + 1 };
  }, { gross: 0, commission: 0, net: 0, count: 0 });
}
export const catalogImportInput = z.object({
  store_id: z.string().uuid(),
  items: z.array(z.object({ key: z.string().min(1).max(40), price: z.coerce.number().min(0).max(100000), stock_qty: z.coerce.number().int().min(0).max(100000).nullable() })).min(1).max(200),
});
