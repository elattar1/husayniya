import { AddressPicker, rememberAddress } from '@/components/AddressPicker';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Suspense, useState, type FormEvent } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Truck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { catalogQuery, storeDetailsQuery } from '@/lib/customer-queries';
import { placeCustomerOrder, getDeliveryAvailability } from '@/lib/customer.functions';
import { money } from '@/lib/labels';
import { pageMeta } from '@/lib/page-meta';
import { CustomerError, CustomerNotFound } from '@/components/CustomerFeedback';

export const Route = createFileRoute('/cart')({
  loader: ({ context }) => context.queryClient.ensureQueryData({ ...catalogQuery, revalidateIfStale: true }),
  head: () => pageMeta('سلة المشتريات', 'مراجعة المشتريات وتحديد العنوان وإرسال طلبك إلى متاجر الحسينية'),
  component: Cart,
  errorComponent: CustomerError,
  notFoundComponent: CustomerNotFound,
});

function Cart() {
  const cart = useCart();
  useSuspenseQuery(catalogQuery);
  if (!cart.store_id || !cart.items.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-7 text-3xl">سلة المشتريات</h1>
        <div className="space-y-5 py-16 text-center">
          <ShoppingCart className="mx-auto size-14 text-muted-foreground" />
          <p>السلة فارغة</p>
          <Button asChild>
            <Link to="/">
              تصفح المتاجر <ArrowLeft />
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center text-muted-foreground">جاري تحميل السلة...</p>}>
      <CartContents storeId={cart.store_id} />
    </Suspense>
  );
}

function CartContents({ storeId }: { storeId: string }) {
  const { data: details } = useSuspenseQuery(storeDetailsQuery(storeId));
  const cart = useCart();
  const { user } = useAuth();
  const { data } = useSuspenseQuery(catalogQuery);
  const [busy, setBusy] = useState(false);
  const place = useServerFn(placeCustomerOrder);
  const navigate = Route.useNavigate();
  const client = useQueryClient();

  const { data: deliveryStatus } = useQuery({
    queryKey: ['delivery-availability'],
    queryFn: () => getDeliveryAvailability(),
    refetchInterval: 15_000,
  });
  const noDelivery = deliveryStatus !== undefined && !deliveryStatus.available;

  const store = data.stores.find(s => s.id === cart.store_id);
  const items = cart.items.map(i => {
    const product =
      details.products.find(p => p.id === i.product_id && p.store_id === cart.store_id) ||
      details.products.find(p => p.name === i.name && p.store_id === cart.store_id);
    return {
      ...i,
      product_id: product?.id ?? i.product_id,
      product,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + Number(i.product?.price ?? i.price) * i.qty, 0);
  const unavailable = !store?.is_open || items.some(i => !i.product?.is_available);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!cart.store_id) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await place({
        data: {
          store_id: cart.store_id,
          items: items.map(i => ({ product_id: i.product_id, qty: i.qty })),
          address: String(form.get('address')),
          phone: String(form.get('phone')),
          area_id: Number(form.get('area')) || null,
          notes: String(form.get('notes')),
        },
      });
      void rememberAddress(form);
      cart.clear();
      await client.invalidateQueries({ queryKey: ['customer-orders'] });
      toast.success('تم إرسال طلبك إلى المتجر');
      navigate({ to: '/orders' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'تعذر إرسال الطلب');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-7 text-3xl">سلة المشتريات</h1>
      {!items.length ? (
        <div className="space-y-5 py-16 text-center">
          <ShoppingCart className="mx-auto size-14 text-muted-foreground" />
          <p>السلة فارغة</p>
          <Button asChild>
            <Link to="/">
              تصفح المتاجر <ArrowLeft />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
          <section>
            <h2 className="mb-4 text-xl">{cart.store_name}</h2>
            {items.map(i => (
              <div key={i.product_id} className="flex flex-wrap items-center justify-between gap-3 border-b py-4">
                <div>
                  <h3 className="font-sans font-semibold">{i.product?.name ?? i.name}</h3>
                  <p className="mt-2 text-primary">{money(Number(i.product?.price ?? i.price) * i.qty)}</p>
                  {!i.product?.is_available && <p className="text-xs text-destructive">المنتج غير متاح، احذفه من السلة</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" aria-label={`تقليل ${i.name}`} onClick={() => cart.setQty(i.product_id, i.qty - 1)}>
                    <Minus />
                  </Button>
                  <span className="w-6 text-center">{i.qty}</span>
                  <Button size="icon" variant="outline" disabled={i.qty >= 99} aria-label={`زيادة ${i.name}`} onClick={() => cart.setQty(i.product_id, i.qty + 1)}>
                    <Plus />
                  </Button>
                  <Button size="icon" variant="ghost" aria-label={`حذف ${i.name}`} onClick={() => cart.setQty(i.product_id, 0)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
            <dl className="mt-6 space-y-3">
              <div className="flex justify-between">
                <dt>قيمة المنتجات</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>التوصيل</dt>
                <dd>{money(store?.delivery_fee)}</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                <dt>الإجمالي</dt>
                <dd>{money(subtotal + Number(store?.delivery_fee ?? 0))}</dd>
              </div>
            </dl>
          </section>
          <section className="border-t pt-5 md:border-r md:border-t-0 md:pr-8 md:pt-0">
            <h2 className="mb-5 text-xl">بيانات التوصيل</h2>
            {!user ? (
              <Button asChild>
                <Link to="/auth" search={{ redirect: '/cart' }}>
                  سجل الدخول لإتمام الطلب
                </Link>
              </Button>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <AddressPicker areas={data.areas} defaultArea={store?.area_id} />
                <label className="block space-y-2 text-sm">
                  ملاحظات
                  <Input name="notes" />
                </label>
                <p className="border-y py-3 text-sm text-muted-foreground">طريقة الدفع: نقدًا عند الاستلام</p>
                {unavailable && <p className="text-sm text-destructive">المتجر مغلق أو توجد منتجات غير متاحة</p>}
                {noDelivery && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-destructive flex items-start gap-2.5">
                    <Truck className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm font-bold">لا يوجد توصيل في الوقت الحالي</strong>
                      <p className="text-xs text-destructive/85 mt-0.5 leading-relaxed">
                        نعتذر، لا يوجد كباتن دليفري متاحين للعمل حالياً. يرجى المحاولة في وقت لاحق عند تفعيل الوردية.
                      </p>
                    </div>
                  </div>
                )}
                <Button className="w-full" type="submit" disabled={busy || unavailable || noDelivery}>
                  {busy ? 'جاري إرسال الطلب...' : noDelivery ? 'التوصيل غير متاح الآن' : 'تأكيد وإرسال الطلب'}
                  <ArrowLeft />
                </Button>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
