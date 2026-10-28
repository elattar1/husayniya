import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { bookingInput, checkoutInput, serviceInput, canCustomerCancel } from './customer-rules';
import { requestKinds } from './dashboard-rules';
import { TIME_SLOTS } from './labels';
export const placeCustomerOrder = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(checkoutInput).handler(async ({ data, context }) => {
  const store = await context.supabase.from('stores').select('is_active,is_open,category').eq('id', data.store_id).single();
  if (!store.data?.is_active || !store.data.is_open || ['doctors', 'maintenance', 'home'].includes(store.data.category)) throw new Error('المتجر غير متاح للطلب الآن');
  const args = { _store_id: data.store_id, _items: data.items, _address: data.address, _phone: data.phone, _notes: data.notes, ...(data.area_id !== null ? { _area_id: data.area_id } : {}) };
  const result = await context.supabase.rpc('place_order', args as typeof args & { _area_id: number });
  if (result.error || !result.data) throw new Error('تعذر إرسال الطلب؛ تحقق من توفر المنتجات وحاول مرة أخرى');
  return { id: result.data };
});
export const createBooking = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(bookingInput).handler(async ({ data, context }) => {
  const store = await context.supabase.from('stores').select('category,is_active,is_open').eq('id', data.store_id).single();
  if (!store.data?.is_active || !store.data.is_open || store.data.category !== 'doctors') throw new Error('الطبيب غير متاح للحجز');
  if (!TIME_SLOTS.includes(data.booking_time)) throw new Error('اختر موعدًا صحيحًا');
  const result = await context.supabase.from('bookings').insert({ ...data, customer_id: context.userId }).select('id').single();
  if (result.error) throw new Error('تعذر الحجز؛ تأكد من التاريخ وحاول مرة أخرى'); return result.data;
});
export const createServiceRequest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(serviceInput).handler(async ({ data, context }) => {
  const store = await context.supabase.from('stores').select('category,is_active,is_open').eq('id', data.store_id).single();
  if (!store.data?.is_active || !store.data.is_open || !['maintenance','home'].includes(store.data.category)) throw new Error('مقدم الخدمة غير متاح');
  if (data.image_paths.some(p => !p.startsWith(`${context.userId}/`) || p.includes('..'))) throw new Error('صور غير صالحة');
  const result = await context.supabase.from('service_requests').insert({ store_id: data.store_id, description: data.description + (data.notes ? `\n${data.notes}` : ''), address: data.address, phone: data.phone, area_id: data.area_id, preferred_date: data.preferred_date, image_paths: data.image_paths, customer_id: context.userId }).select('id').single();
  if (result.error) throw new Error('تعذر إرسال طلب الخدمة'); return result.data;
});
export const getCustomerOrders = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = context.supabase;
  const [orders, bookings, services] = await Promise.all([
    db.from('orders').select('*,order_items(*)').eq('customer_id', context.userId).order('created_at', { ascending: false }),
    db.from('bookings').select('*').eq('customer_id', context.userId).order('created_at', { ascending: false }),
    db.from('service_requests').select('*').eq('customer_id', context.userId).order('created_at', { ascending: false }),
  ]);
  for (const result of [orders,bookings,services]) if (result.error) throw new Error('تعذر تحميل طلباتك');
  return { orders: orders.data ?? [], bookings: bookings.data ?? [], services: services.data ?? [] };
});
export const cancelCustomerRequest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ kind: z.enum(requestKinds), id: z.string().uuid() })).handler(async ({ data, context }) => {
  const row = await context.supabase.from(data.kind).select('status').eq('id', data.id).eq('customer_id', context.userId).single();
  if (!row.data || !canCustomerCancel(data.kind, row.data.status)) throw new Error('لا يمكن إلغاء الطلب في حالته الحالية');
  const result = await context.supabase.from(data.kind).update({ status: 'cancelled' }).eq('id', data.id).eq('customer_id', context.userId).eq('status', row.data.status).select('id').single();
  if (result.error) throw new Error('تعذر الإلغاء؛ حدّث الطلب وحاول مرة أخرى'); return result.data;
});
export const getNotifications = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const result = await context.supabase.from('notifications').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(100);
  if (result.error) throw new Error('تعذر تحميل الإشعارات'); return result.data ?? [];
});
export const readNotification = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(z.object({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  let query = context.supabase.from('notifications').update({ is_read: true }).eq('user_id', context.userId);
  if (data.id) query = query.eq('id', data.id);
  const result = await query; if (result.error) throw new Error('تعذر تحديث الإشعارات'); return { success: true };
});
