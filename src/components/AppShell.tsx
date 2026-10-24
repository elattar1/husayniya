import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bell, Home, ShoppingCart, ClipboardList, Store, Shield, User } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

function useUnread() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread", user?.id],
    enabled: !!user,
    refetchInterval: 20000,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false);
      return count ?? 0;
    },
  });
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useAuth();
  const cart = useCart();
  const { data: unread = 0 } = useUnread();

  const navItem = "flex flex-col items-center gap-0.5 text-[11px] text-muted-foreground px-2 py-1";
  const active = { className: "text-primary font-semibold" };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg text-primary-foreground">ح</span>
            <span className="font-display text-lg text-primary">خدمات الحسينية</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            <Link to="/" activeProps={active} activeOptions={{ exact: true }}>الرئيسية</Link>
            {user && <Link to="/orders" activeProps={active}>طلباتي</Link>}
            {user && <Link to="/provider" activeProps={active}>لوحة المحل</Link>}
            {isAdmin && <Link to="/admin" activeProps={active}>الإدارة</Link>}
          </nav>
          <div className="flex items-center gap-1">
            {user && (
              <Link to="/notifications" className="relative rounded-full p-2 hover:bg-muted" aria-label="الإشعارات">
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            )}
            <Link to="/cart" className="relative rounded-full p-2 hover:bg-muted" aria-label="السلة">
              <ShoppingCart className="h-5 w-5" />
              {cart.count > 0 && (
                <span className="absolute -top-0.5 -left-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] text-accent-foreground">
                  {cart.count}
                </span>
              )}
            </Link>
            <Link to={user ? "/account" : "/auth"} className="rounded-full p-2 hover:bg-muted" aria-label="الحساب">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t bg-card py-2 md:hidden">
        <Link to="/" className={navItem} activeProps={active} activeOptions={{ exact: true }}>
          <Home className="h-5 w-5" />الرئيسية
        </Link>
        <Link to="/cart" className={navItem} activeProps={active}>
          <ShoppingCart className="h-5 w-5" />السلة
        </Link>
        <Link to="/orders" className={navItem} activeProps={active}>
          <ClipboardList className="h-5 w-5" />طلباتي
        </Link>
        <Link to="/provider" className={navItem} activeProps={active}>
          <Store className="h-5 w-5" />محلي
        </Link>
        {isAdmin && (
          <Link to="/admin" className={navItem} activeProps={active}>
            <Shield className="h-5 w-5" />الإدارة
          </Link>
        )}
      </nav>
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl text-primary">{title}</h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "cancelled"
      ? "bg-destructive/10 text-destructive"
      : ["delivered", "completed"].includes(status)
        ? "bg-success/15 text-success"
        : status === "pending"
          ? "bg-accent/25 text-accent-foreground"
          : "bg-primary/10 text-primary";
  const { STATUS_LABELS } = labels;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{STATUS_LABELS[status] ?? status}</span>;
}

import * as labels from "@/lib/labels";
