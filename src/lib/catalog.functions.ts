import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { z } from 'zod';
import {
  REAL_STORES,
  REAL_SECTIONS,
  REAL_PRODUCTS,
  DEFAULT_AREAS,
  DEFAULT_CATEGORIES,
} from './real-stores-data';

function publicCatalogClient() {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('تعذر الاتصال بالخدمات');
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`)
          headers.delete('Authorization');
        headers.set('apikey', key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const db = publicCatalogClient();
    const [storesRes, categoriesRes, areasRes] = await Promise.all([
      db
        .from('stores')
        .select(
          'id,name,category,area_id,description,address,phone,specialty,booking_fee,delivery_fee,rating,reviews_count,is_open,logo_url,banner_url'
        )
        .eq('is_active', true)
        .order('name'),
      db.from('categories').select('*').order('sort'),
      db.from('areas').select('*').order('id'),
    ]);

    // Filter out dummy demo stores containing "(تجريبي)"
    const dbStores = (storesRes.data ?? []).filter((s) => !s.name.includes('(تجريبي)'));

    // Merge curated real stores with any newly created user stores from database
    const storeMap = new Map();
    REAL_STORES.forEach((s) => storeMap.set(s.id, s));
    dbStores.forEach((s) => storeMap.set(s.id, s));

    const finalStores = Array.from(storeMap.values());
    const finalCategories = categoriesRes.data && categoriesRes.data.length > 0 ? categoriesRes.data : DEFAULT_CATEGORIES;
    const finalAreas = areasRes.data && areasRes.data.length > 0 ? areasRes.data : DEFAULT_AREAS;

    return {
      stores: finalStores,
      categories: finalCategories,
      areas: finalAreas,
    };
  } catch (error) {
    console.warn('Error loading remote catalog, using curated fallback:', error);
    return {
      stores: REAL_STORES,
      categories: DEFAULT_CATEGORIES,
      areas: DEFAULT_AREAS,
    };
  }
});

export const getStoreDetails = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ storeId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const staticStore = REAL_STORES.find((s) => s.id === data.storeId);
    const staticProducts = REAL_PRODUCTS.filter((p) => p.store_id === data.storeId);
    const staticSections = REAL_SECTIONS.filter((s) => s.store_id === data.storeId);

    try {
      const db = publicCatalogClient();
      const [productsRes, reviewsRes, sectionsRes] = await Promise.all([
        db
          .from('products')
          .select('id,store_id,name,description,price,is_available,image_url,section_id')
          .eq('store_id', data.storeId)
          .order('name'),
        db
          .from('reviews')
          .select('id,store_id,author_name,rating,comment,created_at')
          .eq('store_id', data.storeId)
          .order('created_at', { ascending: false })
          .limit(100),
        db
          .from('store_sections')
          .select('id,store_id,name,sort_order')
          .eq('store_id', data.storeId)
          .order('sort_order')
          .order('name'),
      ]);

      const dbProducts = productsRes.data ?? [];
      const dbSections = sectionsRes.data ?? [];

      const products = dbProducts.length > 0 ? dbProducts : staticProducts;
      const sections = dbSections.length > 0 ? dbSections : staticSections;
      const reviews = reviewsRes.data ?? [];

      return {
        products,
        reviews,
        sections,
      };
    } catch (error) {
      console.warn('Error loading store details, using curated fallback:', error);
      return {
        products: staticProducts,
        reviews: [],
        sections: staticSections,
      };
    }
  });
