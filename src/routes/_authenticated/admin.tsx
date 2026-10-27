import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { dashboardQuery } from "@/components/dashboard/queries";
import { pageMeta } from "@/lib/page-meta";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (s: SearchSchemaInput & { q?: unknown; tab?: unknown }) => ({ q: typeof s.q === "string" ? s.q : "", tab: ["stores", "orders", "earnings"].includes(String(s.tab)) ? String(s.tab) : "stores" }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery(true)),
  head: () => pageMeta("لوحة الإدارة", "اعتماد المتاجر وضبط العمولات ومراجعة الطلبات والأرباح في خدمات الحسينية"),
  component: Admin,
  errorComponent: ({ error }) => <AdminAccess message={error instanceof Error ? error.message : "تعذر تحميل البيانات"} />,
  notFoundComponent: () => <p>الصفحة غير موجودة</p>,
});

function Admin() {
  const search = Route.useSearch(), navigate = Route.useNavigate();
  return <Dashboard admin search={search.q} tab={search.tab} onSearch={q => navigate({ search: prev => ({ ...prev, q }), replace: true })} onTab={tab => navigate({ search: prev => ({ ...prev, tab }) })} />;
}
function AdminAccess({ message }: { message: string }) {
  const router = useRouter(), client = useQueryClient();
  const { refreshRoles } = useAuth();
  const [busy,setBusy] = useState(false);
  async function setup() {
    setBusy(true);
    try {
      const { data,error } = await supabase.rpc("claim_first_admin");
      if (error) throw error;
      if (!data) { toast.error("يوجد مسؤول بالفعل؛ لا يمكن تفعيل إدارة أخرى بهذه الطريقة"); return; }
      await refreshRoles(); await client.invalidateQueries({ queryKey: ["dashboard"] }); await router.invalidate();
      toast.success("تم تفعيل حساب الإدارة");
    } catch { toast.error("تعذر تفعيل الإدارة"); } finally { setBusy(false); }
  }
  return <div role="alert" className="mx-auto max-w-xl space-y-5 px-4 py-16 text-center"><ShieldCheck className="mx-auto size-12 text-primary" /><h1 className="text-2xl">دخول الإدارة</h1><p className="text-sm text-muted-foreground">{message}</p><p className="text-sm">إذا لم يتم إعداد مسؤول للتطبيق، يمكنك تفعيل حسابك كأول مسؤول. هذا الخيار يتوقف بعد تعيين المسؤول الأول.</p><Button disabled={busy} onClick={setup}><ShieldCheck />{busy ? "جاري التفعيل..." : "تفعيل أول حساب إدارة"}</Button><Button variant="outline" className="mr-2" onClick={() => router.invalidate()}>إعادة المحاولة</Button></div>;
}
