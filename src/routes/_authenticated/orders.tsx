import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { RefreshCw, Package, Check, X, MapPin, MessageCircle, Store, Bike, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/AppShell';
import { customerOrdersQuery, catalogQuery } from '@/lib/customer-queries';
import { cancelCustomerRequest } from '@/lib/customer.functions';
import { canCustomerCancel } from '@/lib/customer-rules';
import { flows, type RequestKind } from '@/lib/dashboard-rules';
import { dateAr, money, STATUS_LABELS } from '@/lib/labels';
import { pageMeta } from '@/lib/page-meta';
import { cleanOrderNotes } from '@/lib/utils';
import { cleanDisplayAddress } from '@/lib/map-utils';
import { CustomerError, CustomerNotFound } from '@/components/CustomerFeedback';
import { PushNotificationControls } from '@/components/PushNotificationControls';
import { OrderChatDialog } from '@/components/OrderChatDialog';
import { OrderReviewDialog } from '@/components/OrderReviewDialog';

export const Route = createFileRoute('/_authenticated/orders')({
  validateSearch: (s: SearchSchemaInput & { filter?: unknown }) => ({
    filter: ['all', 'active', 'completed', 'cancelled'].includes(String(s.filter))
      ? String(s.filter)
      : 'all',
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(customerOrdersQuery),
      context.queryClient.ensureQueryData({ ...catalogQuery, revalidateIfStale: true }),
    ]);
  },
  head: () => pageMeta('طلباتي وحجوزاتي', 'متابعة الطلبات وحجوزات الأطباء والخدمات المنزلية في خدمات الحسينية'),
  component: Orders,
  errorComponent: CustomerError,
  notFoundComponent: CustomerNotFound,
});

function Orders() {
  const { data } = useSuspenseQuery(customerOrdersQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const client = useQueryClient();
  const cancel = useServerFn(cancelCustomerRequest);
  const [busy, setBusy] = useState('');
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const { filter } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Auto-prompt rating dialog if there is a freshly delivered order not yet reviewed
  useEffect(() => {
    const delivered = data.orders.find((o) => o.status === 'delivered');
    if (delivered) {
      try {
        const reviewed = localStorage.getItem(`order_reviewed_${delivered.id}`);
        if (!reviewed) {
          setReviewOrder(delivered);
        }
      } catch {}
    }
  }, [data.orders]);

  const rows = [
    ...data.orders.map((o) => ({
      id: o.id,
      kind: 'orders' as const,
      store_id: o.store_id,
      status: o.status,
      created_at: o.created_at,
      amount: money(o.total),
      description: 'طلب مشتريات',
      address: o.address,
      phone: o.phone,
      notes: o.notes,
      items: o.order_items,
      driver_id: (o as any).driver_id,
      appointment: '',
      images: 0,
    })),
    ...data.bookings.map((o) => ({
      id: o.id,
      kind: 'bookings' as const,
      store_id: o.store_id,
      status: o.status,
      created_at: o.created_at,
      amount: money(o.fee),
      description: o.patient_name,
      address: 'داخل العيادة',
      phone: o.phone,
      notes: o.notes,
      items: [],
      driver_id: null,
      appointment: `${o.booking_date} • ${o.booking_time}`,
      images: 0,
    })),
    ...data.services.map((o) => ({
      id: o.id,
      kind: 'service_requests' as const,
      store_id: o.store_id,
      status: o.status,
      created_at: o.created_at,
      amount: o.quoted_price === null ? 'بانتظار تحديد السعر' : money(o.quoted_price),
      description: o.description,
      address: o.address,
      phone: o.phone,
      notes: null,
      items: [],
      driver_id: null,
      appointment: o.preferred_date ?? '',
      images: o.image_paths.length,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const complete = (status: string) => ['delivered', 'completed'].includes(status);
  const visible = rows.filter(
    (r) =>
      filter === 'all' ||
      (filter === 'completed'
        ? complete(r.status)
        : filter === 'cancelled'
        ? r.status === 'cancelled'
        : !complete(r.status) && r.status !== 'cancelled')
  );

  async function cancelRow(kind: RequestKind, id: string) {
    if (!window.confirm('هل تريد إلغاء هذا الطلب؟')) return;
    setBusy(id);
    try {
      await cancel({ data: { kind, id } });
      await client.invalidateQueries({ queryKey: ['customer-orders'] });
      await client.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('تم إلغاء الطلب');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'تعذر الإلغاء');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-3xl font-bold">طلباتي وحجوزاتي</h1>
        <Button
          variant="outline"
          size="icon"
          title="تحديث الطلبات"
          aria-label="تحديث الطلبات"
          onClick={() => client.invalidateQueries({ queryKey: ['customer-orders'] })}
        >
          <RefreshCw />
        </Button>
      </div>

      <PushNotificationControls />

      <div className="mb-7 flex flex-wrap gap-2">
        {[
          ['all', 'الكل'],
          ['active', 'قيد التنفيذ'],
          ['completed', 'مكتملة'],
          ['cancelled', 'ملغاة'],
        ].map(([value, label]) => (
          <Button
            key={value}
            variant={filter === value ? 'default' : 'outline'}
            onClick={() => navigate({ search: { filter: value ?? 'all' } })}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="space-y-5">
        {visible.map((r) => {
          const cleanNotes = cleanOrderNotes(r.notes);
          return (
            <article key={`${r.kind}-${r.id}`} className="rounded-xl border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {r.kind === 'orders' ? 'مشتريات' : r.kind === 'bookings' ? 'حجز طبيب' : 'خدمة منزلية'} • #
                    {r.id.slice(0, 8)}
                  </p>
                  <h2 className="text-lg font-bold">
                    {catalog.stores.find((s) => s.id === r.store_id)?.name ?? 'متجر غير متاح حاليًا'}
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground">{dateAr(r.created_at)}</p>
                </div>
                <div className="space-y-2 text-left">
                  <StatusBadge status={r.status} />
                  <p className="text-sm font-semibold">{r.amount}</p>
                </div>
              </div>

              {r.status !== 'cancelled' && (
                <ol className="my-5 grid grid-flow-col auto-cols-fr gap-1 border-y py-4">
                  {flows[r.kind].map((s, i) => (
                    <li
                      key={s}
                      className={`min-w-0 text-center ${
                        i <= flows[r.kind].indexOf(r.status) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <span
                        className={`mx-auto mb-2 grid size-6 place-items-center rounded-full ${
                          i <= flows[r.kind].indexOf(r.status)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      <span className="block break-words text-[10px] sm:text-xs">{STATUS_LABELS[s]}</span>
                    </li>
                  ))}
                </ol>
              )}

              {/* أزرار الإجراءات السريعة (المحادثة الفورية، التقييم، وإلغاء الطلب) */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {r.kind === 'orders' && (r.status === 'delivered' || r.status === 'completed') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 font-bold"
                    onClick={() => setReviewOrder(r)}
                  >
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    تقييم المتجر والتوصيل ⭐
                  </Button>
                )}

                {r.kind === 'orders' && r.status !== 'cancelled' && (
                  r.status === 'delivered' || r.status === 'completed' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setChatOrderId(r.id)}
                    >
                      <MessageCircle className="size-3.5" />
                      سجل المحادثة (مغلقة)
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className={`gap-2 font-bold ${
                        r.status === 'on_the_way'
                          ? 'border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10'
                          : 'border-primary/40 text-primary hover:bg-primary/10'
                      }`}
                      onClick={() => setChatOrderId(r.id)}
                    >
                      {r.status === 'on_the_way' ? (
                        <>
                          <Bike className="size-4" />
                          محادثة كابتن التوصيل 🛵
                        </>
                      ) : (
                        <>
                          <Store className="size-4" />
                          محادثة المتجر / السوبرماركت 🏪
                        </>
                      )}
                    </Button>
                  )
                )}

                {canCustomerCancel(r.kind, r.status) && (
                  <Button
                    disabled={busy === r.id}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => cancelRow(r.kind, r.id)}
                  >
                    <X className="size-4 ml-1" />
                    إلغاء الطلب
                  </Button>
                )}
              </div>

              <details className="mt-4 border-t pt-3">
                <summary className="cursor-pointer text-sm text-primary font-medium">تفاصيل الطلب</summary>
                <div className="space-y-3 pt-3 text-sm">
                  <p>{r.description}</p>
                  {r.items.map((i) => (
                    <div className="flex justify-between border-b pb-2" key={i.id}>
                      <span>
                        {i.name} × {i.qty}
                      </span>
                      <span>{money(i.price * i.qty)}</span>
                    </div>
                  ))}
                  {r.appointment && <p>الموعد: {r.appointment}</p>}
                  <p className="flex items-start gap-2">
                    <MapPin size={15} />
                    {cleanDisplayAddress(r.address)}
                  </p>
                  <p>الهاتف: {r.phone}</p>
                  {cleanNotes && <p className="text-muted-foreground">ملاحظات: {cleanNotes}</p>}
                  {r.images > 0 && <p>الصور المرفقة: {r.images}</p>}
                </div>
              </details>
            </article>
          );
        })}
      </div>

      {!visible.length && (
        <div className="space-y-5 py-16 text-center">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <p>لا توجد طلبات هنا بعد</p>
          <Button asChild>
            <Link to="/">تصفح الخدمات</Link>
          </Button>
        </div>
      )}

      {/* محادثة كابتن التوصيل والعميل */}
      <OrderChatDialog
        orderId={chatOrderId}
        open={!!chatOrderId}
        onOpenChange={(open) => !open && setChatOrderId(null)}
      />

      {/* نافذة تقييم المتجر وكابتن التوصيل بعد اكتمال الطلب */}
      <OrderReviewDialog
        orderId={reviewOrder?.id ?? null}
        storeId={reviewOrder?.store_id ?? null}
        storeName={catalog.stores.find((s) => s.id === reviewOrder?.store_id)?.name ?? "المتجر"}
        hasDriver={!!reviewOrder?.driver_id}
        open={!!reviewOrder}
        onOpenChange={(open) => !open && setReviewOrder(null)}
      />
    </div>
  );
}
