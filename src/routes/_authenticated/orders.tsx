import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { RefreshCw, Package, Check, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/AppShell';
import { customerOrdersQuery, catalogQuery } from '@/lib/customer-queries';
import { cancelCustomerRequest } from '@/lib/customer.functions';
import { canCustomerCancel } from '@/lib/customer-rules';
import { flows, type RequestKind } from '@/lib/dashboard-rules';
import { dateAr, money, STATUS_LABELS } from '@/lib/labels';
import { pageMeta } from '@/lib/page-meta';
import { CustomerError, CustomerNotFound } from '@/components/CustomerFeedback';
export const Route = createFileRoute('/_authenticated/orders')({
  validateSearch: (s: Record<string, unknown>) => ({ filter: ['all','active','completed','cancelled'].includes(String(s.filter)) ? String(s.filter) : 'all' }),
  loader: async ({ context }) => { await Promise.all([context.queryClient.ensureQueryData(customerOrdersQuery), context.queryClient.ensureQueryData(catalogQuery)]); },
  head: () => pageMeta('طلباتي وحجوزاتي', 'متابعة الطلبات وحجوزات الأطباء والخدمات المنزلية في خدمات الحسينية'),
  component: Orders, errorComponent: CustomerError, notFoundComponent: CustomerNotFound,
});
function Orders() {
  const { data } = useSuspenseQuery(customerOrdersQuery); const { data: catalog } = useSuspenseQuery(catalogQuery); const client = useQueryClient(); const cancel = useServerFn(cancelCustomerRequest); const [busy,setBusy] = useState(''); const { filter } = Route.useSearch(); const navigate = Route.useNavigate();
  const rows = [
    ...data.orders.map(o => ({ id: o.id, kind: 'orders' as const, store_id: o.store_id, status: o.status, created_at: o.created_at, amount: money(o.total), description: 'طلب مشتريات', address: o.address, phone: o.phone, notes: o.notes, items: o.order_items, appointment: '', images: o.id ? 0 : 0 })),
    ...data.bookings.map(o => ({ id: o.id, kind: 'bookings' as const, store_id: o.store_id, status: o.status, created_at: o.created_at, amount: money(o.fee), description: o.patient_name, address: 'داخل العيادة', phone: o.phone, notes: o.notes, items: [], appointment: `${o.booking_date} • ${o.booking_time}`, images: 0 })),
    ...data.services.map(o => ({ id: o.id, kind: 'service_requests' as const, store_id: o.store_id, status: o.status, created_at: o.created_at, amount: o.quoted_price === null ? 'بانتظار تحديد السعر' : money(o.quoted_price), description: o.description, address: o.address, phone: o.phone, notes: null, items: [], appointment: o.preferred_date ?? '', images: o.image_paths.length })),
  ].sort((a,b) => b.created_at.localeCompare(a.created_at));
  const complete = (status: string) => ['delivered','completed'].includes(status);
  const visible = rows.filter(r => filter === 'all' || (filter === 'completed' ? complete(r.status) : filter === 'cancelled' ? r.status === 'cancelled' : !complete(r.status) && r.status !== 'cancelled'));
  async function cancelRow(kind: RequestKind, id: string) { if (!window.confirm('هل تريد إلغاء هذا الطلب؟')) return; setBusy(id); try { await cancel({ data: { kind,id } }); await client.invalidateQueries({ queryKey: ['customer-orders'] }); await client.invalidateQueries({ queryKey: ['dashboard'] }); toast.success('تم إلغاء الطلب'); } catch(e) { toast.error(e instanceof Error ? e.message : 'تعذر الإلغاء'); } finally { setBusy(''); } }
  return <div className="mx-auto max-w-5xl px-4 py-8"><div className="mb-7 flex items-center justify-between"><h1 className="text-3xl">طلباتي وحجوزاتي</h1><Button variant="outline" size="icon" title="تحديث الطلبات" aria-label="تحديث الطلبات" onClick={() => client.invalidateQueries({ queryKey: ['customer-orders'] })}><RefreshCw /></Button></div><div className="mb-7 flex flex-wrap gap-2">{[['all','الكل'],['active','قيد التنفيذ'],['completed','مكتملة'],['cancelled','ملغاة']].map(([value,label]) => <Button key={value} variant={filter === value ? 'default' : 'outline'} onClick={() => navigate({ search: { filter: value } })}>{label}</Button>)}</div><div className="space-y-5">{visible.map(r => <article key={`${r.kind}-${r.id}`} className="rounded-lg border bg-card p-5"><div className="flex flex-wrap justify-between gap-4"><div><p className="mb-2 text-xs text-muted-foreground">{r.kind === 'orders' ? 'مشتريات' : r.kind === 'bookings' ? 'حجز طبيب' : 'خدمة منزلية'} • #{r.id.slice(0,8)}</p><h2 className="text-lg">{catalog.stores.find(s => s.id === r.store_id)?.name ?? 'متجر غير متاح حاليًا'}</h2><p className="mt-2 text-xs text-muted-foreground">{dateAr(r.created_at)}</p></div><div className="space-y-2 text-left"><StatusBadge status={r.status} /><p className="text-sm font-semibold">{r.amount}</p></div></div>{r.status !== 'cancelled' && <ol className="my-5 grid grid-flow-col auto-cols-fr gap-1 border-y py-4">{flows[r.kind].map((s,i) => <li key={s} className={`min-w-0 text-center ${i <= flows[r.kind].indexOf(r.status) ? 'text-primary' : 'text-muted-foreground'}`}><span className={`mx-auto mb-2 grid size-6 place-items-center rounded-full ${i <= flows[r.kind].indexOf(r.status) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><Check size={12} /></span><span className="block break-words text-[10px] sm:text-xs">{STATUS_LABELS[s]}</span></li>)}</ol>}<details className="mt-4"><summary className="cursor-pointer text-sm text-primary">تفاصيل الطلب</summary><div className="space-y-3 pt-4 text-sm"><p>{r.description}</p>{r.items.map(i => <div className="flex justify-between border-b pb-2" key={i.id}><span>{i.name} × {i.qty}</span><span>{money(i.price*i.qty)}</span></div>)}{r.appointment && <p>الموعد: {r.appointment}</p>}<p className="flex items-start gap-2"><MapPin size={15} />{r.address}</p><p>الهاتف: {r.phone}</p>{r.notes && <p>{r.notes}</p>}{r.images > 0 && <p>الصور المرفقة: {r.images}</p>}</div></details>{canCustomerCancel(r.kind,r.status) && <Button disabled={busy === r.id} size="sm" variant="ghost" className="mt-4 text-destructive" onClick={() => cancelRow(r.kind,r.id)}><X />إلغاء الطلب</Button>}</article>)}</div>{!visible.length && <div className="space-y-5 py-16 text-center"><Package className="mx-auto size-12 text-muted-foreground" /><p>لا توجد طلبات هنا بعد</p><Button asChild><Link to="/">تصفح الخدمات</Link></Button></div>}</div>;
}
