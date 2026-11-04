import { AddressPicker, rememberAddress } from '@/components/AddressPicker';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState, type FormEvent } from 'react';
import { MapPin, Phone, Plus, ShoppingCart, ArrowRight, Star, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { catalogQuery, storeDetailsQuery } from '@/lib/customer-queries';
import { pageMeta } from '@/lib/page-meta';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { createBooking, createServiceRequest } from '@/lib/customer.functions';
import { supabase } from '@/integrations/supabase/client';
import { TIME_SLOTS, CATEGORY_ICONS, money } from '@/lib/labels';
import { CustomerError, CustomerNotFound } from '@/components/CustomerFeedback';
export const Route = createFileRoute('/stores/$storeId')({
  loader: async ({ params, context }) => { const data = await context.queryClient.ensureQueryData(catalogQuery); if (!data.stores.some(s => s.id === params.storeId)) throw notFound(); await context.queryClient.ensureQueryData(storeDetailsQuery(params.storeId)); return data; },
  head: ({ loaderData, params }) => { const s = loaderData?.stores.find(s => s.id === params.storeId); return pageMeta(s?.name ?? 'متجر غير متاح', s?.description || 'منتجات وحجز مواعيد وطلب خدمات في الحسينية'); },
  component: StorePage, errorComponent: CustomerError, notFoundComponent: CustomerNotFound,
});
function StorePage() {
  const { storeId } = Route.useParams(); const { data } = useSuspenseQuery(catalogQuery); const store = data.stores.find(s => s.id === storeId); const { data: details } = useSuspenseQuery(storeDetailsQuery(storeId));
  const cart = useCart(); const { user } = useAuth(); const navigate = Route.useNavigate(); const client = useQueryClient();
  const book = useServerFn(createBooking), request = useServerFn(createServiceRequest); const [busy,setBusy] = useState(false); const [files,setFiles] = useState<File[]>([]);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  if (!store) return <CustomerNotFound />;
  const doctor = store.category === 'doctors'; const service = ['maintenance','home'].includes(store.category); const products = details.products.filter(p => p.store_id === storeId);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!user || !store) return; const form = new FormData(e.currentTarget); setBusy(true);
    const uploaded: string[] = [];
    try {
      if (doctor) { await book({ data: { store_id: storeId, patient_name: String(form.get('patient_name')), phone: String(form.get('phone')), booking_date: String(form.get('date')), booking_time: String(form.get('time')), notes: String(form.get('notes') ?? '') } }); }
      else {
        for (const file of files) {
          const path = `${user.id}/${crypto.randomUUID()}.${file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'}`;
          const result = await supabase.storage.from('service-images').upload(path,file); if (result.error) throw new Error('تعذر رفع الصور'); uploaded.push(path);
        }
        await request({ data: { store_id: storeId, description: String(form.get('description')), address: String(form.get('address')), phone: String(form.get('phone')), area_id: Number(form.get('area')) || null, notes: '', preferred_date: String(form.get('date')) || null, image_paths: uploaded } }); void rememberAddress(form);
      }
      await client.invalidateQueries({ queryKey: ['customer-orders'] }); toast.success(doctor ? 'تم إرسال طلب الحجز' : 'تم إرسال طلب الخدمة'); navigate({ to: '/orders' });
    } catch (error) { if (uploaded.length) await supabase.storage.from('service-images').remove(uploaded); toast.error(error instanceof Error ? error.message : 'تعذر إرسال الطلب'); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl px-4 py-7"><Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-primary"><ArrowRight size={16} />المتاجر والخدمات</Link>{store.banner_url && <img src={store.banner_url} alt={`بانر ${store.name}`} className="mb-5 h-40 w-full rounded-xl object-cover md:h-56" />}<header className="mb-8 flex flex-wrap items-start gap-5 border-b pb-7">{store.logo_url ? <img src={store.logo_url} alt={`لوجو ${store.name}`} className={`size-20 shrink-0 rounded-lg border-4 border-background object-cover shadow ${store.banner_url ? "-mt-14" : ""}`} /> : <div className="grid size-20 shrink-0 place-items-center rounded-lg bg-secondary text-5xl">{CATEGORY_ICONS[store.category]}</div>}<div className="min-w-0 flex-1"><p className="mb-2 text-sm text-muted-foreground">{data.categories.find(c => c.slug === store.category)?.name} • <span className={store.is_open ? 'text-success' : ''}>{store.is_open ? 'مفتوح' : 'مغلق الآن'}</span></p><h1 className="break-words text-2xl md:text-3xl">{store.name}</h1><p className="mt-3 text-sm text-muted-foreground">{store.description}</p><div className="mt-4 flex flex-wrap gap-4 text-sm"><span className="flex items-center gap-1"><MapPin size={15} />{store.address} • {data.areas.find(a => a.id === store.area_id)?.name}</span>{store.phone && <a className="flex items-center gap-1 text-primary" href={`tel:${store.phone}`}><Phone size={15} />{store.phone}</a>}</div></div>{!doctor && !service && <Button asChild><Link to="/cart"><ShoppingCart />السلة ({cart.count})</Link></Button>}</header>
    {!doctor && !service ? <><div className="mb-5 flex flex-wrap justify-between gap-3"><h2 className="text-xl">المنتجات</h2><p className="text-sm text-muted-foreground">رسوم التوصيل: {money(store.delivery_fee)}</p></div><div className="grid gap-4 md:grid-cols-2">{products.map(p => <article className="flex min-w-0 items-center gap-4 rounded-lg border bg-card p-4" key={p.id}>{p.image_url && <img src={p.image_url} alt={p.name} loading="lazy" className="size-20 shrink-0 rounded-md object-cover" />}<div className="min-w-0 flex-1"><h3 className="break-words font-sans font-semibold">{p.name}</h3><p className="my-2 text-sm text-muted-foreground">{p.description}</p><p className="font-semibold text-primary">{money(p.price)}</p></div><Button size="icon" aria-label={`إضافة ${p.name} للسلة`} title={`إضافة ${p.name}`} disabled={!p.is_available || !store.is_open} onClick={() => { if (cart.add(store,{ product_id: p.id, name: p.name, price: Number(p.price) })) toast.success('تمت الإضافة للسلة'); }}><Plus /></Button></article>)}</div>{!products.length && <p className="py-12 text-center text-muted-foreground">لا توجد منتجات بعد</p>}</> : <section className="max-w-2xl"><h2 className="mb-5 flex items-center gap-2 text-xl"><CalendarDays />{doctor ? 'حجز موعد' : 'طلب خدمة منزلية'}</h2>{doctor && <p className="mb-5 text-primary">{store.specialty} • رسوم الحجز {money(store.booking_fee)}</p>}{!user ? <Button asChild><Link to="/auth" search={{ redirect: `/stores/${storeId}` }}>سجل الدخول {doctor ? 'للحجز' : 'لطلب الخدمة'}</Link></Button> : <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{doctor ? <label className="space-y-2 text-sm">اسم المريض<Input name="patient_name" required minLength={2} /></label> : <label className="space-y-2 text-sm sm:col-span-2">تفاصيل الخدمة<textarea name="description" required minLength={5} className="min-h-28 w-full rounded-md border bg-card p-3" /></label>}{doctor ? <label className="space-y-2 text-sm">رقم الهاتف<Input name="phone" type="tel" required minLength={6} /></label> : <div className="sm:col-span-2"><AddressPicker areas={data.areas} defaultArea={store.area_id} /></div>}<label className="space-y-2 text-sm">{doctor ? 'تاريخ الحجز' : 'التاريخ المفضل (اختياري)'}<Input name="date" type="date" min={today} required={doctor} /></label>{doctor && <><label className="space-y-2 text-sm">الموعد<select name="time" className="h-10 w-full rounded-md border bg-card px-3">{TIME_SLOTS.map(t => <option key={t}>{t}</option>)}</select></label><label className="space-y-2 text-sm sm:col-span-2">ملاحظات<Input name="notes" /></label></>}{service && <label className="space-y-2 text-sm sm:col-span-2">صور الخدمة (اختياري)<Input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => { const chosen = Array.from(e.target.files ?? []); if (chosen.length > 5 || chosen.some(f => f.size > 5*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(f.type))) { toast.error('اختر حتى 5 صور، كل صورة أقل من 5 ميجابايت'); e.target.value = ''; setFiles([]); } else setFiles(chosen); }} /><p className="text-xs text-muted-foreground">{files.length ? `${files.length} صور مرفقة` : 'السعر يحدده مقدم الخدمة'}</p></label>}<Button className="sm:col-span-2" type="submit" disabled={busy || !store.is_open}>{busy ? 'جاري الإرسال...' : doctor ? 'إرسال طلب الحجز' : 'إرسال طلب الخدمة'}</Button></form>}</section>}
    <section className="mt-10 border-t pt-6"><h2 className="mb-5 text-xl">تقييمات العملاء</h2>{details.reviews.filter(r => r.store_id === storeId).map(r => <article key={r.id} className="border-b py-4"><p className="flex items-center gap-2 font-semibold">{r.author_name}<Star size={14} className="text-accent" />{r.rating}/5</p><p className="mt-2 text-sm text-muted-foreground">{r.comment}</p></article>)}{!details.reviews.some(r => r.store_id === storeId) && <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد</p>}</section>
  </div>;
}
