import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { dashboardQuery } from "@/components/dashboard/queries";
import { pageMeta } from "@/lib/page-meta";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/provider")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "", tab: ["stores", "products", "orders", "earnings"].includes(String(s.tab)) ? String(s.tab) : "stores" }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery(false)),
  head: () => pageMeta("لوحة مقدم الخدمة", "إدارة المتجر والمنتجات والطلبات والحجوزات ومستحقات مقدم الخدمة في خدمات الحسينية"),
  component: Provider,
  errorComponent: ({ error }) => <DashboardError message={error.message} />,
  notFoundComponent: () => <p>المتجر غير موجود</p>,
});

function Provider() {
  const search = Route.useSearch(), navigate = Route.useNavigate();
  return <Dashboard admin={false} search={search.q} tab={search.tab} onSearch={q => navigate({ search: prev => ({ ...prev, q }), replace: true })} onTab={tab => navigate({ search: prev => ({ ...prev, tab }) })} />;
}
function DashboardError({ message }: { message: string }) {
  const router = useRouter();
  return <div role="alert" className="mx-auto max-w-xl space-y-4 p-10 text-center"><h1 className="text-xl">تعذر تحميل لوحة المتجر</h1><p className="text-sm text-muted-foreground">{message}</p><Button onClick={() => router.invalidate()}>إعادة المحاولة</Button></div>;
}
