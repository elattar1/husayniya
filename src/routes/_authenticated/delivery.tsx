import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCheck, MapPin, Phone, RefreshCw, Store, Truck, Wallet, PackageOpen, Navigation, Volume2, VolumeX, Radio } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

function Delivery() {
  const { data, isFetching } = useSuspenseQuery({ ...driverBoardQuery, refetchInterval: 15_000 });
  const qc = useQueryClient();
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const claim = useServerFn(claimOrder), complete = useServerFn(completeOrder);
  const [confirm, setConfirm] = useState<DeliveryOrder | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevAvailableCount = useRef(data.available.length);

  const current = data.mine.filter(o => o.status === "on_the_way");
  const wallet = driverWallet(data.mine);

  // تشغيل تنبيه صوتي عند ظهور طلبات جديدة بالرادار مستوحى من husayniya-driver
  useEffect(() => {
    if (soundEnabled && data.available.length > prevAvailableCount.current) {
      playBeep();
      toast.info("🚨 طلب توصيل جديد متاح في رادار خدمات الحسينية!");
    }
    prevAvailableCount.current = data.available.length;
  }, [data.available.length, soundEnabled]);

  const action = useMutation({
    mutationFn: ({ id, delivered }: { id: string; delivered: boolean }) => delivered ? complete({ data: { id } }) : claim({ data: { id } }),
    onSuccess: async (_, variables) => {
      setConfirm(null);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["delivery-board"] }),
        qc.invalidateQueries({ queryKey: ["delivery-fleet"] }),
        qc.invalidateQueries({ queryKey: ["dashboard"] }),
        qc.invalidateQueries({ queryKey: ["customer-orders"] }),
      ]);
      toast.success(variables.delivered ? "تم تسجيل التوصيل والتحصيل بنجاح" : "تم استلام الطلب وأصبح في عهدتك");
      if (!variables.delivered) navigate({ search: { tab: "current" } });
    },
    onError: (error) => toast.error(error.message),
  });

  if (!data.driver || !data.driver.is_active) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <Truck className="mx-auto size-14 text-primary" />
        <h1 className="text-2xl">لوحة كابتن الدليفري</h1>
        <p className="text-muted-foreground">
          {data.driver ? "حساب الدليفري موقوف حاليًا. تواصل مع الإدارة لإعادة تفعيله." : "حسابك غير مسجل ضمن فريق الدليفري. تواصل مع الإدارة لإضافتك."}
        </p>
      </div>
    );
  }

  const list = tab === "current" ? current : data.available;

  return (
    <div className="mx-auto max-w-5xl px-4 py-7">
      {/* رأس شاشة السائق */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              متصل - جاهز لتوصيل الطلبات
            </span>
          </div>
          <PageTitle title={`أهلًا يا كابتن ${data.driver.full_name}`} sub="دليفري خدمات الحسينية" />
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={() => {
              setSoundEnabled(prev => !prev);
              toast.info(soundEnabled ? "تم كتم صوت التنبيهات" : "تم تفعيل صوت التنبيهات للطلبات الجديدة");
            }}
          >
            {soundEnabled ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4 text-muted-foreground" />}
            {soundEnabled ? "تنبيه الصوت نشط" : "صوت صامت"}
          </Button>

          <Button
            size="icon"
            variant="outline"
            aria-label="تحديث الطلبات"
            title="تحديث الطلبات"
            disabled={isFetching}
            onClick={() => qc.invalidateQueries({ queryKey: ["delivery-board"] })}
          >
            <RefreshCw className={isFetching ? "animate-spin size-4" : "size-4"} />
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات الحية */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <DeliveryStat label="طلبات متاحة بالرادار" value={data.available.length} />
        <DeliveryStat label="معك للتوصيل الآن" value={current.length} />
        <DeliveryStat label="توصيلاتك اليوم" value={wallet.todayCount} />
        <DeliveryStat label="أرباحك اليوم" value={money(wallet.todayEarnings)} />
      </div>

      <Tabs dir="rtl" value={tab} onValueChange={value => navigate({ search: { tab: value } })}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3">
          <TabsTrigger value="available" className="gap-1 px-1">
            <Radio className="size-4" />
            رادار المتاحة ({data.available.length})
          </TabsTrigger>
          <TabsTrigger value="current" className="gap-1 px-1">
            <Truck className="size-4" />
            معي الآن ({current.length})
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-1 px-1">
            <Wallet className="size-4" />
            المحفظة والحساب
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "wallet" ? (
        <section>
          <h2 className="mb-3 text-lg font-bold">سجل التوصيلات والمحفظة</h2>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DeliveryStat label="أرباح التوصيل المسجلة" value={money(wallet.earnings)} />
            <DeliveryStat label="النقد المحصّل للتسليم" value={money(wallet.cashCollected)} />
            <DeliveryStat label="التوصيلات المكتملة" value={wallet.deliveredCount} />
          </div>
          {data.mine.filter(o => o.status === "delivered").map(o => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-4">
              <div>
                <p className="font-semibold">{o.stores?.name} · #{o.id.slice(0, 8)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{dateAr(o.delivered_at ?? o.created_at)}</p>
              </div>
              <div className="text-sm text-left sm:text-right">
                <p className="font-bold text-primary">أجر التوصيل: {money(o.delivery_fee)}</p>
                <p className="text-muted-foreground text-xs">المحصّل: {money(o.total)}</p>
              </div>
            </div>
          ))}
          {wallet.deliveredCount === 0 && <Empty text="لا توجد توصيلات مكتملة حتى الآن" />}
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {list.map(o => (
            <article key={o.id} className="min-w-0 rounded-xl border bg-card p-5 shadow-soft">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-medium text-muted-foreground">طلب #{o.id.slice(0, 8)}</span>
                <StatusBadge status={o.status} />
              </div>

              {/* بيانات المتجر المستلم منه */}
              <div className="mb-3 rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-base font-bold">
                    <Store className="size-4 shrink-0 text-primary" />
                    {o.stores?.name ?? "المتجر"}
                  </h2>
                  {o.stores?.phone && (
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <a href={`tel:${o.stores.phone}`}>
                        <Phone className="size-3" />
                        اتصال
                      </a>
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{o.stores?.address || "عنوان المتجر غير مسجل"}</p>
              </div>

              {/* تفاصيل عنوان العميل والملاحة */}
              <div className="my-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground break-words">{o.address}</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{data.areas.find(a => a.id === o.area_id)?.name}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs shrink-0 gap-1">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address + " الحسينية الشرقية")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="size-3" />
                      خريطة
                    </a>
                  </Button>
                </div>
              </div>

              {/* محتويات الطلب */}
              <div className="my-3 space-y-1.5 border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">محتويات الشحنة:</p>
                {o.order_items.map((item, i) => (
                  <div key={`${item.name}-${i}`} className="flex justify-between text-xs">
                    <span className="break-words font-medium">{item.name}</span>
                    <span className="shrink-0 text-muted-foreground font-mono">× {item.qty}</span>
                  </div>
                ))}
              </div>

              {o.notes && (
                <p className="mt-2 text-xs bg-amber-500/10 text-amber-900 dark:text-amber-200 p-2 rounded border border-amber-500/20">
                  <strong>ملاحظات العميل:</strong> {o.notes}
                </p>
              )}

              {/* المبالغ */}
              <div className="mt-4 flex flex-wrap justify-between gap-2 rounded-lg bg-muted/60 p-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">المطلوب تحصيله من العميل</span>
                  <strong className="text-base text-destructive">{money(o.total)}</strong>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-muted-foreground block">أجرك في هذا التوصيل</span>
                  <strong className="text-base text-success">{money(o.delivery_fee)}</strong>
                </div>
              </div>

              {/* أزرار الاتصال والمراسلة */}
              {tab === "current" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`tel:${o.phone}`}>
                      <Phone className="size-3.5 ml-1" />
                      اتصال بالعميل
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1 text-emerald-600">
                    <a href={`https://wa.me/20${o.phone.replace(/\D/g, "").replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer">
                      واتساب العميل
                    </a>
                  </Button>
                </div>
              )}

              {/* زر تنفيذ الإجراء */}
              <Button
                className="mt-4 w-full font-bold shadow-md"
                disabled={action.isPending || (tab === "available" && current.length > 0)}
                onClick={() => tab === "current" ? setConfirm(o) : action.mutate({ id: o.id, delivered: false })}
              >
                {tab === "current" ? (
                  <>
                    <CheckCheck className="ml-1.5 size-4" />
                    تم التوصيل والتحصيل نقدًا
                  </>
                ) : (
                  <>
                    <Truck className="ml-1.5 size-4" />
                    {current.length > 0 ? "أكمل توصيل الطلب الحالي أولًا" : action.isPending ? "جارٍ قبول الطلب…" : "استلام الطلب وبدء التوصيل"}
                  </>
                )}
              </Button>
            </article>
          ))}

          {list.length === 0 && (
            <div className="md:col-span-2">
              <Empty text={tab === "current" ? "لا يوجد طلب قيد التوصيل معك حاليًا" : "لا توجد طلبات متاحة للتوصيل حاليًا في الرادار"} />
            </div>
          )}
        </section>
      )}

      {/* نافذة تأكيد تحصيل النقدية */}
      <Dialog open={!!confirm} onOpenChange={open => { if (!open && !action.isPending) setConfirm(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد تسليم الطلب والتحصيل</DialogTitle>
            <DialogDescription>
              هل سلّمت الطلب للعميل بنجاح وحصّلت مبلغ <strong className="text-foreground">{money(confirm?.total)}</strong> نقدًا؟
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1 font-bold"
              disabled={action.isPending}
              onClick={() => { if (confirm) action.mutate({ id: confirm.id, delivered: true }); }}
            >
              {action.isPending ? "جارٍ التسجيل…" : "نعم، تم التسليم والتحصيل"}
            </Button>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground shadow-soft">
      <PackageOpen className="mx-auto mb-3 size-12 text-muted-foreground/60" />
      <p className="text-base font-medium">{text}</p>
    </div>
  );
}
