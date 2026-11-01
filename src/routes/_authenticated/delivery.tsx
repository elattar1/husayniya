import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCheck, MapPin, Phone, RefreshCw, Store, Truck, Wallet, PackageOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageTitle, StatusBadge } from "@/components/AppShell";
import { DeliveryError, DeliveryStat } from "@/components/DeliveryShared";
import { driverBoardQuery } from "@/lib/delivery-queries";
import { claimOrder, completeOrder, getDriverBoard } from "@/lib/delivery.functions";
import { driverWallet } from "@/lib/delivery-rules";
import { money, dateAr } from "@/lib/labels";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/_authenticated/delivery")({
  validateSearch: (s: Record<string, unknown>) => ({ tab: ["available", "current", "wallet"].includes(String(s["tab"])) ? String(s["tab"]) : "available" }),
  loader: ({ context }) => context.queryClient.ensureQueryData(driverBoardQuery),
  head: () => pageMeta("لوحة كابتن الدليفري", "الطلبات المتاحة والتوصيل الحالي وحساب أرباح كابتن خدمات الحسينية"),
  component: Delivery,
  errorComponent: DeliveryError,
  notFoundComponent: () => <p className="p-8">الصفحة غير موجودة</p>,
});

type DeliveryOrder = Awaited<ReturnType<typeof getDriverBoard>>["mine"][number];

function Delivery() {
  const { data, isFetching } = useSuspenseQuery({ ...driverBoardQuery, refetchInterval: 20_000 });
  const qc = useQueryClient();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const claim = useServerFn(claimOrder), complete = useServerFn(completeOrder);
  const [confirm, setConfirm] = useState<DeliveryOrder | null>(null);
  const current = data.mine.filter(o => o.status === "on_the_way");
  const wallet = driverWallet(data.mine);
  const action = useMutation({
    mutationFn: ({ id, delivered }: { id: string; delivered: boolean }) => delivered ? complete({ data: { id } }) : claim({ data: { id } }),
    onSuccess: async (_, variables) => {
      setConfirm(null);
      await Promise.all([qc.invalidateQueries({ queryKey: ["delivery-board"] }), qc.invalidateQueries({ queryKey: ["delivery-fleet"] }), qc.invalidateQueries({ queryKey: ["dashboard"] }), qc.invalidateQueries({ queryKey: ["customer-orders"] })]);
      toast.success(variables.delivered ? "تم تسجيل التوصيل والتحصيل" : "الطلب أصبح معك");
      if (!variables.delivered) navigate({ search: { tab: "current" } });
    },
    onError: (error) => toast.error(error.message),
  });
  if (!data.driver || !data.driver.is_active) return <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center"><Truck className="mx-auto size-14 text-primary" /><h1 className="text-2xl">لوحة كابتن الدليفري</h1><p className="text-muted-foreground">{data.driver ? "حساب الدليفري موقوف حاليًا. تواصل مع الإدارة لإعادة تفعيله." : "حسابك غير مسجل ضمن فريق الدليفري. تواصل مع الإدارة لإضافتك."}</p></div>;

  const list = tab === "current" ? current : data.available;
  return <div className="mx-auto max-w-5xl px-4 py-7">
    <div className="flex items-start justify-between gap-3"><PageTitle title={`أهلًا يا كابتن ${data.driver.full_name}`} sub="دليفري خدمات الحسينية" /><Button size="icon" variant="outline" aria-label="تحديث الطلبات" title="تحديث الطلبات" disabled={isFetching} onClick={() => qc.invalidateQueries({ queryKey: ["delivery-board"] })}><RefreshCw className={isFetching ? "animate-spin" : ""} /></Button></div>
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4"><DeliveryStat label="طلبات متاحة" value={data.available.length} /><DeliveryStat label="معك الآن" value={current.length} /><DeliveryStat label="توصيلات اليوم" value={wallet.todayCount} /><DeliveryStat label="أرباح اليوم" value={money(wallet.todayEarnings)} /></div>
    <Tabs dir="rtl" value={tab} onValueChange={value => navigate({ search: { tab: value } })}><TabsList className="mb-6 grid h-auto w-full grid-cols-3"><TabsTrigger value="available" className="gap-1 px-1"><PackageOpen className="size-4" />المتاحة</TabsTrigger><TabsTrigger value="current" className="gap-1 px-1"><Truck className="size-4" />معي الآن</TabsTrigger><TabsTrigger value="wallet" className="gap-1 px-1"><Wallet className="size-4" />الحساب</TabsTrigger></TabsList></Tabs>
    {tab === "wallet" ? <section><h2 className="mb-3 text-lg">سجل التوصيلات</h2><div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3"><DeliveryStat label="أرباح التوصيل المسجلة" value={money(wallet.earnings)} /><DeliveryStat label="النقد المحصّل" value={money(wallet.cashCollected)} /><DeliveryStat label="التوصيلات المكتملة" value={wallet.deliveredCount} /></div>{data.mine.filter(o => o.status === "delivered").map(o => <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-4"><div><p className="font-medium">{o.stores?.name} · #{o.id.slice(0, 8)}</p><p className="mt-1 text-xs text-muted-foreground">{dateAr(o.delivered_at ?? o.created_at)}</p></div><div className="text-sm"><p>أجر التوصيل: {money(o.delivery_fee)}</p><p className="text-muted-foreground">المحصّل: {money(o.total)}</p></div></div>)}{wallet.deliveredCount === 0 && <Empty text="لا توجد توصيلات مكتملة حتى الآن" />}</section> : <section className="grid gap-4 md:grid-cols-2">
      {list.map(o => <article key={o.id} className="min-w-0 rounded-lg border bg-card p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-muted-foreground">طلب #{o.id.slice(0, 8)}</span><StatusBadge status={o.status} /></div><h2 className="flex items-center gap-2 text-lg"><Store className="size-5 shrink-0 text-primary" />{o.stores?.name ?? "المتجر"}</h2><p className="mt-2 break-words text-sm text-muted-foreground">{o.stores?.address || "عنوان المتجر غير مسجل"}</p><div className="my-4 border-y py-3"><p className="flex items-start gap-2 text-sm"><MapPin className="size-4 shrink-0 text-primary" /><span className="break-words">{o.address}</span></p><p className="mt-1 text-xs text-muted-foreground">{data.areas.find(a => a.id === o.area_id)?.name}</p></div><ul className="space-y-1 text-sm">{o.order_items.map((item, i) => <li key={`${item.name}-${i}`} className="flex justify-between gap-2"><span className="break-words">{item.name}</span><span className="shrink-0">× {item.qty}</span></li>)}</ul>{o.notes && <p className="mt-3 break-words text-sm text-muted-foreground">ملاحظات: {o.notes}</p>}<div className="mt-4 flex flex-wrap justify-between gap-2 text-sm"><p>التحصيل: <strong>{money(o.total)}</strong></p><p>أجر التوصيل: <strong>{money(o.delivery_fee)}</strong></p></div><div className="mt-4 flex flex-wrap gap-2">{o.stores?.phone && <Button asChild variant="outline" size="sm"><a href={`tel:${o.stores.phone}`}><Phone />المتجر</a></Button>}{tab === "current" && <><Button asChild variant="outline" size="sm"><a href={`tel:${o.phone}`}><Phone />العميل</a></Button><Button asChild variant="outline" size="sm"><a href={`https://wa.me/20${o.phone.replace(/\D/g, "").replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer">واتساب العميل</a></Button></>}</div><Button className="mt-4 w-full" disabled={action.isPending || (tab === "available" && current.length > 0)} onClick={() => tab === "current" ? setConfirm(o) : action.mutate({ id: o.id, delivered: false })}>{tab === "current" ? <><CheckCheck />تم التوصيل والتحصيل</> : <><Truck />{current.length > 0 ? "أكمل الطلب الحالي أولًا" : action.isPending ? "جارٍ قبول الطلب…" : "استلام الطلب"}</>}</Button></article>)}
      {list.length === 0 && <div className="md:col-span-2"><Empty text={tab === "current" ? "لا يوجد طلب معك حاليًا" : "لا توجد طلبات متاحة للتوصيل حاليًا"} /></div>}
    </section>}
    <Dialog open={!!confirm} onOpenChange={open => { if (!open && !action.isPending) setConfirm(null); }}><DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md" dir="rtl"><DialogHeader><DialogTitle>تأكيد التوصيل</DialogTitle><DialogDescription>هل سلّمت الطلب للعميل وحصّلت {money(confirm?.total)} نقدًا؟</DialogDescription></DialogHeader><Button disabled={action.isPending} onClick={() => { if (confirm) action.mutate({ id: confirm.id, delivered: true }); }}>{action.isPending ? "جارٍ التسجيل…" : "تأكيد التوصيل والتحصيل"}</Button></DialogContent></Dialog>
  </div>;
}
function Empty({ text }: { text: string }) { return <div className="py-16 text-center text-muted-foreground"><PackageOpen className="mx-auto mb-3 size-10" /><p>{text}</p></div>; }