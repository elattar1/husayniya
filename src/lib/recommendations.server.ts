import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { NoObjectGeneratedError } from 'ai';
import { createResponsesCall } from './ai/responses.server.ts';
import { gatewayFailure, groundRecommendations, type RecommendationOutput } from './recommendation-rules';
import { REAL_STORES, REAL_PRODUCTS } from './real-stores-data';
import { matchRecommendations } from './recommendation-matcher';

type Input = { description: string; area_id: number | null };
class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function recommendFromCatalog(
  data: Input,
  db: SupabaseClient<Database>,
  request: Request
): Promise<{ ok: true } & RecommendationOutput | { ok: false; status: number; message: string }> {
  // تجميع كافة المتاجر من قاعدة البيانات مع المتاجر الحقيقية المضافة
  let allStores = [...REAL_STORES];
  try {
    let query = db
      .from('stores')
      .select('id,name,category,area_id,description,specialty,is_open')
      .eq('is_active', true);

    if (data.area_id !== null) {
      query = query.eq('area_id', data.area_id);
    }
    const catalog = await query.order('name');
    if (catalog.data && catalog.data.length > 0) {
      const dbStores = catalog.data.filter((s) => !s.name.includes('(تجريبي)'));
      const storeMap = new Map();
      REAL_STORES.forEach((s) => {
        if (data.area_id === null || s.area_id === data.area_id) {
          storeMap.set(s.id, s);
        }
      });
      dbStores.forEach((s) => storeMap.set(s.id, s));
      allStores = Array.from(storeMap.values());
    }
  } catch (e) {
    console.warn('Could not query remote db stores for recommendation, using real stores catalog:', e);
  }

  // فلترة المتاجر حسب المنطقة إن وجدت
  const filteredStores =
    data.area_id !== null ? allStores.filter((s) => s.area_id === data.area_id) : allStores;

  const storesToUse = filteredStores.length > 0 ? filteredStores : allStores;

  if (!storesToUse.length) {
    return {
      ok: true as const,
      summary: 'لا توجد متاجر أو خدمات متاحة في هذه المنطقة حاليًا.',
      suggestions: [],
    };
  }

  try {
    // التحقق من مفتاح الذكاء الاصطناعي وبوابة الاستجابة
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) {
      // استخدام محرك البحث الذكي المباشر المربوط بقاعدة البيانات
      const localResult = matchRecommendations(data.description, data.area_id, storesToUse, REAL_PRODUCTS);
      return { ok: true as const, ...localResult };
    }

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const access = await supabaseAdmin
      .from('ai_recommendation_access_state')
      .select('status,message')
      .eq('id', 'service-recommendations')
      .maybeSingle();

    if (access.data) {
      // في حالة وجود حظر على البوابة، نعود فوراً لمحرك المطابقة الذكي المحلي
      const localResult = matchRecommendations(data.description, data.area_id, storesToUse, REAL_PRODUCTS);
      return { ok: true as const, ...localResult };
    }

    const call = createResponsesCall(
      request,
      {
        baseURL: 'https://ai.gateway.lovable.dev/v1',
        apiKey: key,
        model: 'openai/gpt-6-astra',
        inspectResponse: async (response) => {
          if (response.ok) return;
          const body: unknown = await response.clone().json().catch(() => null);
          const failure = gatewayFailure(response.status, body);
          if (failure.persist) {
            await supabaseAdmin.from('ai_recommendation_access_state').upsert({
              id: 'service-recommendations',
              status: failure.status,
              message: failure.message,
            });
          }
          throw new GatewayError(failure.status, failure.message);
        },
      },
      [{ role: 'user', content: JSON.stringify({ description: data.description, stores: storesToUse.slice(0, 40) }) }],
      'أنت مساعد منصة خدمات الحسينية في محافظة الشرقية بمصر. افهم طلب العميل باللهجة المصرية واقترح أنسب المتاجر والمطاعم والخدمات من القائمة فقط مع ذكر سبب مختصر. إذا كان طلب العميل لا علاقة له بالمتاجر أو الخدمات أو المأكولات أو الصيانة (مثل: الجواز، الفضاء، السياسة، الفلوس، الامتحانات، الحيوانات المفترسة، الهزار، أو النكات)، فرد عليه برد فكاهي خفيف الظل باللهجة المصرية الشرقاوية في الـ summary واجعل قائمة الـ suggestions فارغة تمامًا.'
    );

    const output = await call.result.output;
    return { ok: true as const, ...groundRecommendations(output, storesToUse.map((s) => s.id)) };
  } catch (error) {
    // عند حدوث أي خطأ في بوابة الذكاء الاصطناعي الخارجية، ننتقل تلقائياً لمحرك المطابقة المربوط بقاعدة البيانات
    console.warn('AI gateway fallback to catalog matcher:', error);
    const fallbackResult = matchRecommendations(data.description, data.area_id, storesToUse, REAL_PRODUCTS);
    return { ok: true as const, ...fallbackResult };
  }
}
