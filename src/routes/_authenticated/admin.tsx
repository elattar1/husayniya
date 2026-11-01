import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { dashboardQuery } from "@/components/dashboard/queries";
import { pageMeta } from "@/lib/page-meta";
import { Button } from "@/components/ui/button";

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
  return <><div className="mx-auto max-w-6xl px-4 pt-4"><Button asChild variant="outline"><Link to="/drivers">إدارة فريق الدليفري</Link></Button></div><Dashboard admin search={search.q} tab={search.tab} onSearch={q => navigate({ search: prev => ({ ...prev, q }), replace: true })} onTab={tab => navigate({ search: prev => ({ ...prev, tab }) })} /></>;
}
function AdminAccess({ message }: { message: string }) {
  const router = useRouter();
  return <div role="alert" className="mx-auto max-w-xl space-y-5 px-4 py-16 text-center"><ShieldCheck className="mx-auto size-12 text-primary" /><h1 className="text-2xl">دخول الإدارة</h1><p className="text-sm text-muted-foreground">{message}</p><p className="text-sm">هذه الصفحة متاحة لمديري التطبيق فقط.</p><Button variant="outline" onClick={() => router.invalidate()}>إعادة المحاولة</Button></div>;
}
