import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ShieldCheck, MessageSquareWarning, Megaphone, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { dashboardQuery } from "@/components/dashboard/queries";
import { pageMeta } from "@/lib/page-meta";
import { Button } from "@/components/ui/button";
import { AdminComplaints } from "@/components/dashboard/AdminComplaints";
import { AdminBroadcastNotification } from "@/components/dashboard/AdminBroadcastNotification";
import { useOffersVisibility } from "@/lib/use-offers-visibility";

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (s: SearchSchemaInput & { q?: unknown; tab?: unknown }) => ({
    q: typeof s.q === "string" ? s.q : "",
    tab: ["stores", "products", "orders", "earnings"].includes(String(s.tab)) ? String(s.tab) : "stores",
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData({ ...dashboardQuery(true), revalidateIfStale: true }),
  head: () => pageMeta("لوحة الإدارة", "اعتماد المتاجر وضبط العمولات ومراجعة الطلبات والأرباح في خدمات الحسينية"),
  component: Admin,
  errorComponent: ({ error }) => <AdminAccess message={error instanceof Error ? error.message : "تعذر تحميل البيانات"} />,
  notFoundComponent: () => <p>الصفحة غير موجودة</p>,
});

function Admin() {
  const search = Route.useSearch(), navigate = Route.useNavigate();
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const { isVisible: isOffersVisible, isLoading: isOffersLoading, toggle: toggleOffers } = useOffersVisibility();

  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5 px-4 pt-4">
        {/* زر ومؤشر التحكم في إظهار وإخفاء تابة العروض */}
        <Button
          variant={isOffersVisible ? "outline" : "secondary"}
          size="sm"
          disabled={isOffersLoading}
          onClick={() => toggleOffers(!isOffersVisible)}
          className={`gap-2 font-bold shadow-soft transition-all ${
            isOffersVisible
              ? "border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              : "border-muted-foreground/30 text-muted-foreground hover:bg-muted"
          }`}
          title={isOffersVisible ? "تابة العروض ظاهرة حالياً للجميع، اضغط لإخفائها بالكامل" : "تابة العروض مخفية، اضغط لإظهارها في شريط التنقل"}
        >
          {isOffersLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isOffersVisible ? (
            <Eye className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" />
          )}
          <span>{isOffersVisible ? "تابة العروض: ظاهرة" : "تابة العروض: مخفية"}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
              isOffersVisible
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-slate-500/20 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isOffersVisible ? "مفعلة (انقر للإخفاء)" : "موقوفة (انقر للتفعيل)"}
          </span>
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBroadcastOpen(true)}
            className="gap-2 font-bold border-primary text-primary hover:bg-primary/10 shadow-soft"
          >
            <Megaphone className="size-4" />
            إرسال إشعار جماعي
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setComplaintsOpen(true)}
            className="gap-2 font-bold shadow-soft"
          >
            <MessageSquareWarning className="size-4" />
            الشكاوى والاقتراحات
          </Button>
        </div>
      </div>

      <Dashboard
        admin
        search={search.q}
        tab={search.tab}
        onSearch={q => navigate({ search: prev => ({ ...prev, q }), replace: true })}
        onTab={tab => navigate({ search: prev => ({ ...prev, tab }) })}
      />

      <AdminComplaints open={complaintsOpen} onOpenChange={setComplaintsOpen} />
      <AdminBroadcastNotification open={broadcastOpen} onOpenChange={setBroadcastOpen} />
    </>
  );
}

function AdminAccess({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div role="alert" className="mx-auto max-w-xl space-y-5 px-4 py-16 text-center">
      <ShieldCheck className="mx-auto size-12 text-primary" />
      <h1 className="text-2xl">دخول الإدارة</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-sm">هذه الصفحة متاحة لمديري التطبيق فقط.</p>
      <Button variant="outline" onClick={() => router.invalidate()}>إعادة المحاولة</Button>
    </div>
  );
}
