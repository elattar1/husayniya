import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bookingInput, checkoutInput, serviceInput, canCustomerCancel } from './customer-rules';
import { requestKinds } from './dashboard-rules';
import { TIME_SLOTS } from './labels';

export const placeCustomerOrder = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(checkoutInput)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { REAL_STORES, REAL_SECTIONS, REAL_PRODUCTS } = await import('./real-stores-data');

    // 1. Ensure store exists in DB (auto-seed if it's a curated store)
    let store = await context.supabase
      .from('stores')
      .select('id,is_active,is_open,category,delivery_fee,commission_rate')
      .eq('id', data.store_id)
      .maybeSingle();

    if (!store.data) {
      const staticStore = REAL_STORES.find(s => s.id === data.store_id);
      if (staticStore) {
        await supabaseAdmin.from('stores').upsert(
          {
            id: staticStore.id,
            name: staticStore.name,
            category: staticStore.category,
            area_id: staticStore.area_id,
            description: staticStore.description,
            phone: staticStore.phone,
            address: staticStore.address,
            specialty: staticStore.specialty ?? null,
            delivery_fee: staticStore.delivery_fee,
            booking_fee: staticStore.booking_fee,
            commission_rate: staticStore.commission_rate,
            is_active: true,
            is_open: staticStore.is_open,
            logo_url: staticStore.logo_url,
            banner_url: staticStore.banner_url,
          },
          { onConflict: 'id', ignoreDuplicates: true },
        );

        store = await context.supabase
          .from('stores')
          .select('id,is_active,is_open,category,delivery_fee,commission_rate')
          .eq('id', data.store_id)
          .maybeSingle();
      }
    }

    if (!store.data?.is_active || !store.data.is_open || ['doctors', 'maintenance', 'home'].includes(store.data.category)) {
      throw new Error('المتجر غير متاح للطلب الآن');
    }

    // التحقق من وجود دليفري شغال في الوقت الحالي
    const activeDrivers = await supabaseAdmin
      .from('drivers')
      .select('user_id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (!activeDrivers.count || activeDrivers.count === 0) {
      throw new Error('لا يوجد توصيل في الوقت الحالي، جميع كباتن التوصيل غير متاحين الآن');
    }

    // 2. Normalize and resolve item product IDs (supports both legacy 35-char and new 36-char IDs)
    const storeSuffix = data.store_id.replace(/^.*-(\d{3,4})$/, '$1').padStart(4, '0');
    const resolvedItems = data.items.map(item => {
      let pid = item.product_id;
      const legacyMatch = pid.match(/^20000000-0000-0000-0000-0{9,11}(\d+)$/);
      if (legacyMatch) {
        const prodNum = String(Number(legacyMatch[1])).padStart(12, '0');
        pid = `40000000-0000-0000-${storeSuffix}-${prodNum}`;
      }
      return { ...item, product_id: pid };
    });

    // 3. Ensure sections and products exist in DB for this store so Postgres foreign keys and checks pass
    const resolvedIds = resolvedItems.map(i => i.product_id);
    const dbProducts = await context.supabase
      .from('products')
      .select('id,is_available,price')
      .eq('store_id', data.store_id)
      .in('id', resolvedIds);

    const existingIds = new Set((dbProducts.data ?? []).map((p: any) => p.id));
    const missing = resolvedItems.filter(i => !existingIds.has(i.product_id));

    if (missing.length > 0) {
      // Seed sections first to satisfy foreign key constraints
      const staticSections = REAL_SECTIONS.filter(sec => sec.store_id === data.store_id);
      if (staticSections.length > 0) {
        await supabaseAdmin.from('store_sections').upsert(staticSections, { onConflict: 'id', ignoreDuplicates: true });
      }

      // Seed products from REAL_PRODUCTS
      const staticStoreProds = REAL_PRODUCTS.filter(p => p.store_id === data.store_id);
      if (staticStoreProds.length > 0) {
        await supabaseAdmin.from('products').upsert(
          staticStoreProds.map(p => ({
            id: p.id,
            store_id: p.store_id,
            section_id: p.section_id,
            name: p.name,
            description: p.description,
            price: p.price,
            is_available: p.is_available,
            image_url: p.image_url,
          })),
          { onConflict: 'id', ignoreDuplicates: true },
        );
      }
    }

    // 4. Place order via database function
    const args = {
      _store_id: data.store_id,
      _items: resolvedItems,
      _address: data.address,
      _phone: data.phone,
      _notes: data.notes,
      ...(data.area_id !== null ? { _area_id: data.area_id } : {}),
    };
    const result = await context.supabase.rpc('place_order', args as typeof args & { _area_id: number });
    if (result.error || !result.data) {
      console.error('place_order error:', result.error);
      throw new Error('تعذر إرسال الطلب؛ تحقق من توفر المنتجات وحاول مرة أخرى');
    }
    return { id: result.data };
  });

export const createBooking = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(bookingInput)
  .handler(async ({ data, context }) => {
    const store = await context.supabase.from('stores').select('category,is_active,is_open').eq('id', data.store_id).single();
    if (!store.data?.is_active || !store.data.is_open || store.data.category !== 'doctors') throw new Error('الطبيب غير متاح للحجز');
    if (!TIME_SLOTS.includes(data.booking_time)) throw new Error('اختر موعدًا صحيحًا');
    const result = await context.supabase.from('bookings').insert({ ...data, customer_id: context.userId }).select('id').single();
    if (result.error) throw new Error('تعذر الحجز؛ تأكد من التاريخ وحاول مرة أخرى');
    return result.data;
  });

export const createServiceRequest = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(serviceInput)
  .handler(async ({ data, context }) => {
    const store = await context.supabase.from('stores').select('category,is_active,is_open').eq('id', data.store_id).single();
    if (!store.data?.is_active || !store.data.is_open || !['maintenance', 'home'].includes(store.data.category)) throw new Error('مقدم الخدمة غير متاح');
    if (data.image_paths.some(p => !p.startsWith(`${context.userId}/`) || p.includes('..'))) throw new Error('صور غير صالحة');
    const result = await context.supabase.from('service_requests').insert({
      store_id: data.store_id,
      description: data.description + (data.notes ? `\n${data.notes}` : ''),
      address: data.address,
      phone: data.phone,
      area_id: data.area_id,
      preferred_date: data.preferred_date,
      image_paths: data.image_paths,
      customer_id: context.userId,
    }).select('id').single();
    if (result.error) throw new Error('تعذر إرسال طلب الخدمة');
    return result.data;
  });

export const getCustomerOrders = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const [orders, bookings, services] = await Promise.all([
      db.from('orders').select('*,order_items(*)').eq('customer_id', context.userId).order('created_at', { ascending: false }),
      db.from('bookings').select('*').eq('customer_id', context.userId).order('created_at', { ascending: false }),
      db.from('service_requests').select('*').eq('customer_id', context.userId).order('created_at', { ascending: false }),
    ]);
    for (const result of [orders, bookings, services]) {
      if (result.error) throw new Error('تعذر تحميل طلباتك');
    }
    return { orders: orders.data ?? [], bookings: bookings.data ?? [], services: services.data ?? [] };
  });

export const cancelCustomerRequest = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ kind: z.enum(requestKinds), id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const row = await context.supabase.from(data.kind).select('status').eq('id', data.id).eq('customer_id', context.userId).single();
    if (!row.data || !canCustomerCancel(data.kind, row.data.status)) throw new Error('لا يمكن إلغاء الطلب في حالته الحالية');
    const result = await context.supabase.from(data.kind).update({ status: 'cancelled' }).eq('id', data.id).eq('customer_id', context.userId).eq('status', row.data.status).select('id').single();
    if (result.error) throw new Error('تعذر الإلغاء؛ حدّث الطلب وحاول مرة أخرى');
    return result.data;
  });

export const getNotifications = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const result = await context.supabase.from('notifications').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(100);
    if (result.error) throw new Error('تعذر تحميل الإشعارات');
    return result.data ?? [];
  });

export const readNotification = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid().optional() }))
  .handler(async ({ data, context }) => {
    let query = context.supabase.from('notifications').update({ is_read: true }).eq('user_id', context.userId);
    if (data.id) query = query.eq('id', data.id);
    const result = await query;
    if (result.error) throw new Error('تعذر تحديث الإشعارات');
    return { success: true };
  });

export const getDeliveryAvailability = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { count } = await supabaseAdmin
      .from('drivers')
      .select('user_id', { count: 'exact', head: true })
      .eq('is_active', true);
    return { available: (count ?? 0) > 0, count: count ?? 0 };
  });

export const submitOrderReview = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      orderId: z.string().uuid(),
      storeId: z.string().uuid(),
      storeRating: z.number().min(1).max(5),
      storeComment: z.string().trim().max(500).optional(),
      driverRating: z.number().min(1).max(5).optional(),
      driverComment: z.string().trim().max(500).optional(),
    })
  )
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const orderRes = await supabaseAdmin
      .from('orders')
      .select('id, customer_id, driver_id, store_id, stores(name)')
      .eq('id', data.orderId)
      .eq('customer_id', context.userId)
      .maybeSingle();

    if (!orderRes.data) {
      throw new Error('لم يتم العثور على الطلب');
    }

    const profile = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', context.userId)
      .maybeSingle();
    const authorName = profile.data?.full_name || 'عميل';

    await supabaseAdmin.from('reviews').insert({
      store_id: data.storeId,
      user_id: context.userId,
      author_name: authorName,
      rating: data.storeRating,
      comment: data.storeComment || 'تقييم جودة الخدمة والمنتجات',
    });

    if (data.driverRating && orderRes.data.driver_id) {
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: orderRes.data.driver_id,
          title: `⭐ تقييم جديد لخدمة التوصيل (${data.driverRating}/5)`,
          body: data.driverComment || 'قيّم العميل خدمة التوصيل بنجاح. شكراً لجهودك!',
          link: '/delivery?tab=wallet',
        });
      } catch (err) {
        console.error('Driver review notification error:', err);
      }
    }

    return { success: true };
  });
