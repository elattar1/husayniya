import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { notificationsQuery } from '@/lib/customer-queries';
import { readNotification } from '@/lib/customer.functions';
import { pageMeta } from '@/lib/page-meta';
import { dateAr } from '@/lib/labels';
import { CustomerError, CustomerNotFound } from '@/components/CustomerFeedback';
export const Route = createFileRoute('/_authenticated/notifications')({ loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQuery), head: () => pageMeta('الإشعارات', 'آخر تحديثات طلباتك وحجوزاتك في خدمات الحسينية'), component: Notifications, errorComponent: CustomerError, notFoundComponent: CustomerNotFound });
function Notifications() { const { data } = useSuspenseQuery(notificationsQuery); const read = useServerFn(readNotification); const client = useQueryClient(); async function mark(id?: string) { try { await read({ data: { id } }); await Promise.all([client.invalidateQueries({ queryKey: ['notifications'] }),client.invalidateQueries({ queryKey: ['unread'] })]); } catch { toast.error('تعذر تحديث الإشعارات'); } } return <div className="mx-auto max-w-3xl px-4 py-8"><div className="mb-7 flex flex-wrap justify-between gap-4"><h1 className="text-3xl">الإشعارات</h1><Button variant="outline" disabled={!data.some(n => !n.is_read)} onClick={() => mark()}><CheckCheck />قراءة الكل</Button></div>{data.map(n => <article key={n.id} className={`border-b p-4 ${!n.is_read ? 'bg-primary/5' : ''}`}><h2 className="font-sans font-semibold">{n.title}</h2><p className="my-2 text-sm">{n.body}</p><p className="mb-3 text-xs text-muted-foreground">{dateAr(n.created_at)}</p><Button asChild variant="link" className="px-0"><Link to="/orders" onClick={() => mark(n.id)}>عرض طلباتي</Link></Button>{!n.is_read && <Button size="sm" variant="ghost" onClick={() => mark(n.id)}>تحديد كمقروء</Button>}</article>)}{!data.length && <div className="py-16 text-center text-muted-foreground"><Bell className="mx-auto mb-4 size-12" />لا توجد إشعارات بعد</div>}</div>; }
