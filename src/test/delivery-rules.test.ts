import { describe, expect, it } from "vitest";
import { driverWallet } from "@/lib/delivery-rules";

describe("Delivery wallet accounting", () => {
  it("counts delivery fees and collected cash only for delivered orders", () => {
    expect(driverWallet([
      { status: "delivered", delivery_fee: 20, total: 120, delivered_at: "2026-11-01T10:00:00Z" },
      { status: "on_the_way", delivery_fee: 30, total: 200, delivered_at: null },
      { status: "cancelled", delivery_fee: 40, total: 300, delivered_at: null },
    ], new Date("2026-11-01T12:00:00Z"))).toEqual({ deliveredCount: 1, todayCount: 1, earnings: 20, todayEarnings: 20, cashCollected: 120 });
  });
});
import { allowedNext as storeNext } from "@/lib/dashboard-rules";
describe("store order steps", () => {
  it("store can move an accepted order to ready", () => { expect(storeNext("orders", "accepted")).toContain("preparing"); });
  it("store cannot mark ready orders on the way or delivered", () => { expect(storeNext("orders", "preparing")).toEqual([]); expect(storeNext("orders", "on_the_way")).toEqual([]); });
});
