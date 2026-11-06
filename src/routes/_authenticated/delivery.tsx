import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCheck, MapPin, Phone, RefreshCw, Store, Truck, Wallet, PackageOpen, Navigation, Volume2, VolumeX, Radio, Power, PowerOff, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageTitle, StatusBadge } from "@/components/AppShell";
import { DeliveryError, DeliveryStat } from "@/components/DeliveryShared";
import { driverBoardQuery } from "@/lib/delivery-queries";
import { claimOrder, completeOrder, getDriverBoard, setMyDriverWorkingStatus } from "@/lib/delivery.functions";
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
  const setWorkingStatus = useServerFn(setMyDriverWorkingStatus);
  const [confirm, setConfirm] = useState<DeliveryOrder | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevAvailableCount = useRef(data.available.length);

  const current = data.mine.filter(o => o.status === "on_the_way");
  const wallet = driverWallet(data.mine);
  const isWorking = !!data.driver?.is_active;

  // تشغيل تنبيه صوتي عند ظهور طلبات جديدة بالرادار إذا كان السائق شغالاً
  useEffect(() => {
    if (isWorking && soundEnabled && data.available.length > prevAvailableCount.current) {
      playBeep();
      toast.info("🚨 طلب توصيل جديد متاح في رادار خدمات الحسينية!");
    }
    prevAvailableCount.current = data.available.length;
  }, [data.available.length, soundEnabled, isWorking]);

  const toggleStatus = useMutation({
    mutationFn: (newStatus: boolean) => setWorkingStatus({ data: { is_active: newStatus } }),
    onSuccess: async (_, newStatus) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["delivery-board"] }),
        qc.invalidateQueries({ queryKey: ["delivery-fleet"] }),
        qc.invalidateQueries({ queryKey: ["delivery-availability"] }),
      ]);
      toast.success(newStatus ? "أنت الآن شغال ومتاح لاستقبال طلبات التوصيل!" : "تم إيقاف الوردية - أنت الآن في وضع غير متاح");
    },
    onError: (err) => toast.error(err.message),
  });

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

  if (!data.driver) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-16 text-center">
        <Truck className="mx-auto size-14 text-primary" />
        <h1 className="text-2xl font-bold">لوحة كابتن الدليفري</h1>
        <p className="text-muted-foreground">
          حسابك غير مسجل ضمن فريق الدليفري. يمكنك تقديم طلب انضمام من صفحة حسابي ليتم تفعيلك من قِبل الإدارة.
        </p>
      </div>
    );
  }

  const list = tab === "current" ? current : data.available;

  return (
    <div className="mx-auto max-w-5xl px-4 py-7">
      {/* رأس شاشة السائق: زر واضح لمعرفة وتبديل حالة العمل (شغال / غير شغال) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`flex size-3 rounded-full ${isWorking ? "bg-emerald-500 animate-pulse" : "bg-destructive"}`} />
            <span className={`text-xs font-bold ${isWorking ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
              {isWorking ? "شغال ومتاح للتوصيل الآن" : "غير شغال (خارج الوردية حاليًا)"}
            </span>
          </div>
          <PageTitle title={`أهلًا يا كابتن ${data.driver.full_name}`} sub="دليفري خدمات الحسينية" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* زر تبديل حالة العمل (شغال / غير شغال) */}
          <Button
            size="sm"
            disabled={toggleStatus.isPending}
            onClick={() => toggleStatus.mutate(!isWorking)}
            className={`font-bold gap-1.5 shadow-sm ${
              isWorking
                ? "bg-destructive/15 hover:bg-destructive/25 text-destructive border border-destructive/30"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isWorking ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            {isWorking ? "إيقاف الوردية (أنا غير شغال الآن)" : "بدء الوردية (أنا شغال الآن)"}
          </Button>

          {isWorking && (
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
              {soundEnabled ? "الصوت مفعّل" : "الصوت صامت"}
            </Button>
          )}

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

      {/* تنبيه إذا كان السائق غير شغال */}
      {!isWorking && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive flex items-center justify-between gap-3 shadow-soft">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <div>
              <strong className="block text-sm">أنت في وضع (غير شغال) حالياً</strong>
              <p className="text-xs text-destructive/85 mt-0.5">
                لن تظهر لك أي طلبات في الرادار ولن يظهر للعملاء إمكانية التوصيل إذا كان كل الكباتن غير شغالين. اضغط (بدء الوردية) لبدء استقبال الطلبات.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => toggleStatus.mutate(true)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs shrink-0 font-bold"
          >
            بدء العمل الآن
          </Button>
        </div>
      )}

      {/* تبويبات الشاشات المنفصلة */}
      <Tabs dir="rtl" value={tab} onValueChange={value => navigate({ search: { tab: value } })}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3">
          <TabsTrigger value="current" className="gap-1 px-1 py-2 font-bold">
            <Truck className="size-4" />
            معي الآن ({current.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-1 px-1 py-2 font-bold">
            <Radio className="size-4" />
            رادار الطلبات ({data.available.length})
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-1 px-1 py-2 font-bold">
            <Wallet className="size-4" />
            المحفظة والحساب
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* الجزء 1: المحفظة والأرباح فقط */}
      {tab === "wallet" && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">محفظة الكابتن وسجل التحصيلات</h2>
            <span className="text-xs text-muted-foreground">تحديث لحظي لجميع توصيلاتك</span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <DeliveryStat label="أرباحك اليوم" value={money(wallet.todayEarnings)} />
            <DeliveryStat label="توصيلاتك اليوم" value={wallet.todayCount} />
            <DeliveryStat label="إجمالي أرباح التوصيل" value={money(wallet.earnings)} />
            <DeliveryStat label="النقدية المحصلة للتسليم" value={money(wallet.cashCollected)} />
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-soft">
            <h3 className="mb-4 text-base font-bold">سجل التوصيلات المكتملة ({wallet.deliveredCount})</h3>
            <div className="divide-y">
              {data.mine.filter(o => o.status === "delivered").map(o => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <p className="font-semibold text-sm">{o.stores?.name} · <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</span></p>
                    <p className="mt-1 text-xs text-muted-foreground">{dateAr(o.delivered_at ?? o.created_at)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-sm text-success">أجر التوصيل: {money(o.delivery_fee)}</p>
                    <p className="text-xs text-muted-foreground">المحصّل من العميل: {money(o.total)}</p>
                  </div>
                </div>
              ))}
            </div>
            {wallet.deliveredCount === 0 && <Empty text="لا توجد توصيلات مكتملة مسجلة في حسابك حتى الآن" />}
          </div>
        </section>
      )}

      {/* الجزء 2: الطلب الحالي قيد التوصيل فقط */}
      {tab === "current" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">الطلب قيد التوصيل معك الآن ({current.length})</h2>
            <span className="text-xs text-muted-foreground">قم بتأكيد التسليم بعد تحصيل المبلغ من العميل</span>
          </div>

          {current.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {current.map(o => (
                <article key={o.id} className="min-w-0 rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-soft">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <span className="text-xs font-mono font-medium text-muted-foreground">طلب #{o.id.slice(0, 8)}</span>
                    <StatusBadge status={o.status} />
                  </div>

                  {/* بيانات المتجر المستلم منه */}
                  <div className="mb-3 rounded-xl border bg-muted/40 p-3">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-base font-bold">
                        <Store className="size-4 shrink-0 text-primary" />
                        {o.stores?.name ?? "المتجر"}
                      </h3>
                      {o.stores?.phone && (
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <a href={`tel:${o.stores.phone}`}>
                            <Phone className="size-3" />
                            اتصال بالمتجر
                          </a>
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{o.stores?.address || "عنوان المتجر غير مسجل"}</p>
                  </div>

                  {/* تفاصيل عنوان العميل والملاحة */}
                  <div className="my-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                        <div>
                          <span className="font-bold text-foreground break-words">{o.address}</span>
                          <p className="mt-0.5 text-xs text-muted-foreground">{data.areas.find(a => a.id === o.area_id)?.name}</p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs shrink-0 gap-1 font-bold">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address + " الحسينية الشرقية")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="size-3.5" />
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
                    <p className="mt-2 text-xs bg-amber-500/10 text-amber-900 dark:text-amber-200 p-2.5 rounded-lg border border-amber-500/20">
                      <strong>ملاحظات العميل:</strong> {o.notes}
                    </p>
                  )}

                  {/* المبالغ */}
                  <div className="mt-4 flex flex-wrap justify-between gap-2 rounded-xl bg-muted/60 p-3 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground block">المطلوب تحصيله من العميل</span>
                      <strong className="text-base font-bold text-destructive">{money(o.total)}</strong>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-muted-foreground block">أجرك في هذا التوصيل</span>
                      <strong className="text-base font-bold text-success">{money(o.delivery_fee)}</strong>
                    </div>
                  </div>

                  {/* أزرار الاتصال والمراسلة */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1 font-semibold">
                      <a href={`tel:${o.phone}`}>
                        <Phone className="size-3.5 ml-1" />
                        اتصال بالعميل
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1 font-semibold text-emerald-600">
                      <a href={`https://wa.me/20${o.phone.replace(/\D/g, "").replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer">
                        واتساب العميل
                      </a>
                    </Button>
                  </div>

                  {/* زر تأكيد التسليم */}
                  <Button
                    className="mt-4 w-full font-bold shadow-md h-10"
                    disabled={action.isPending}
                    onClick={() => setConfirm(o)}
                  >
                    <CheckCheck className="ml-1.5 size-4" />
                    تم التوصيل والتحصيل نقدًا
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <Empty text="لا يوجد طلب قيد التوصيل معك حاليًا. تفقّد رادار الطلبات المتاحة لاستلام طلب جديد." />
          )}
        </section>
      )}

      {/* الجزء 3: رادار الطلبات المتاحة فقط */}
      {tab === "available" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">رادار الطلبات المتاحة للتوصيل ({data.available.length})</h2>
            <span className="text-xs text-muted-foreground">طلبات جاهزة للاستلام من المتاجر</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {data.available.map(o => (
              <article key={o.id} className="min-w-0 rounded-2xl border bg-card p-5 shadow-soft">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <span className="text-xs font-mono font-medium text-muted-foreground">طلب #{o.id.slice(0, 8)}</span>
                  <StatusBadge status={o.status} />
                </div>

                <div className="mb-3 rounded-xl border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-bold">
                      <Store className="size-4 shrink-0 text-primary" />
                      {o.stores?.name ?? "المتجر"}
                    </h3>
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

                <div className="my-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground break-words">{o.address}</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">{data.areas.find(a => a.id === o.area_id)?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-2 rounded-xl bg-muted/60 p-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">التحصيل من العميل</span>
                    <strong className="text-base font-bold text-destructive">{money(o.total)}</strong>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-muted-foreground block">أجرك في التوصيل</span>
                    <strong className="text-base font-bold text-success">{money(o.delivery_fee)}</strong>
                  </div>
                </div>

                <Button
                  className="mt-4 w-full font-bold shadow-md h-10"
                  disabled={action.isPending || current.length > 0 || !isWorking}
                  onClick={() => action.mutate({ id: o.id, delivered: false })}
                >
                  <Truck className="ml-1.5 size-4" />
                  {!isWorking ? "يجب بدء الوردية أولاً" : current.length > 0 ? "أكمل الطلب الحالي معك أولاً" : action.isPending ? "جارٍ قبول الطلب…" : "استلام الطلب وبدء التوصيل"}
                </Button>
              </article>
            ))}

            {data.available.length === 0 && (
              <div className="md:col-span-2">
                <Empty text={isWorking ? "لا توجد طلبات جديدة في الرادار حالياً. سيتم تنبيهك بصوت فور توفر طلب." : "أنت غير شغال حالياً. قم ببدء الوردية لتظهر الطلبات المتاحة."} />
              </div>
            )}
          </div>
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
    <div className="rounded-2xl border bg-card py-16 text-center text-muted-foreground shadow-soft">
      <PackageOpen className="mx-auto mb-3 size-12 text-muted-foreground/60" />
      <p className="text-base font-medium">{text}</p>
    </div>
  );
}
