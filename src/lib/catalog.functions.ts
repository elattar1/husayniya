import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { z } from 'zod';
function publicCatalogClient() {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('تعذر الاتصال بالخدمات');
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
}
export const getCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const db = publicCatalogClient();
  const [stores, categories, areas] = await Promise.all([
    db.from('stores').select('id,name,category,area_id,description,address,phone,specialty,booking_fee,delivery_fee,rating,reviews_count,is_open,logo_url,banner_url').eq('is_active', true).order('name'),
    db.from('categories').select('*').order('sort'), db.from('areas').select('*').order('id'),
  ]);
  for (const result of [stores, categories, areas]) if (result.error) throw new Error('تعذر تحميل المتاجر، حاول مرة أخرى');
  return { stores: stores.data ?? [], categories: categories.data ?? [], areas: areas.data ?? [] };
});
export const getStoreDetails = createServerFn({ method: 'GET' }).inputValidator(z.object({ storeId: z.string().uuid() })).handler(async ({ data }) => {
  const db = publicCatalogClient();
  const active = await db.from('stores').select('id').eq('id', data.storeId).eq('is_active', true).maybeSingle();
  if (active.error) throw new Error('تعذر تحميل المتجر');
  if (!active.data) return { products: [], reviews: [] };
  const [products, reviews] = await Promise.all([
    db.from('products').select('id,store_id,name,description,price,is_available,image_url').eq('store_id', data.storeId).order('name'),
    db.from('reviews').select('id,store_id,author_name,rating,comment,created_at').eq('store_id', data.storeId).order('created_at', { ascending: false }).limit(100),
  ]);
  if (products.error || reviews.error) throw new Error('تعذر تحميل منتجات وتقييمات المتجر');
  return { products: products.data ?? [], reviews: reviews.data ?? [] };
});
