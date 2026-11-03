import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
export const getCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('تعذر الاتصال بالخدمات');
  const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => { const headers = new Headers(init?.headers); if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey', key); return fetch(input, { ...init, headers }); } } });
  const [stores, categories, areas, products, reviews] = await Promise.all([
    db.from('stores').select('id,name,category,area_id,description,address,phone,specialty,booking_fee,delivery_fee,rating,reviews_count,is_open,logo_url,banner_url').eq('is_active', true).order('name'),
    db.from('categories').select('*').order('sort'), db.from('areas').select('*').order('id'),
    db.from('products').select('id,store_id,name,description,price,is_available,image_url').order('name'),
    db.from('reviews').select('id,store_id,author_name,rating,comment,created_at').order('created_at', { ascending: false }).limit(100),
  ]);
  for (const result of [stores, categories, areas, products, reviews]) if (result.error) throw new Error('تعذر تحميل المتاجر، حاول مرة أخرى');
  const storeIds = new Set((stores.data ?? []).map(s => s.id));
  return { stores: stores.data ?? [], categories: categories.data ?? [], areas: areas.data ?? [], products: (products.data ?? []).filter(p => storeIds.has(p.store_id)), reviews: reviews.data ?? [] };
});
