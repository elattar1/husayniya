import { describe, expect, it } from 'vitest';
import { matchRecommendations } from '@/lib/recommendation-matcher';
import { REAL_STORES, REAL_PRODUCTS } from '@/lib/real-stores-data';
import { gatewayFailure, groundRecommendations, recommendationInput } from '@/lib/recommendation-rules';

describe('AI service recommendations', () => {
  it('suggests only actual eligible catalog stores, without invented or duplicate IDs', () => {
    expect(groundRecommendations({ summary: 'سباكة', suggestions: [
      { store_id: 'plumber', reason: 'إصلاح المواسير' },
      { store_id: 'invented', reason: 'غير موجود' },
      { store_id: 'plumber', reason: 'مكرر' },
    ] }, ['plumber']).suggestions).toEqual([{ store_id: 'plumber', reason: 'إصلاح المواسير' }]);
  });
  it('never includes providers excluded from the selected area', () => {
    expect(groundRecommendations({ summary: '', suggestions: [{ store_id: 'other-area', reason: '' }] }, ['selected-area']).suggestions).toEqual([]);
  });
  it('validates descriptions before a billable request', () => {
    expect(recommendationInput.safeParse({ description: '  ', area_id: null }).success).toBe(false);
    expect(recommendationInput.safeParse({ description: 'محتاج سباك لإصلاح تسريب', area_id: 1 }).success).toBe(true);
  });
  it('preserves upstream denial status and safe reason and persists the block', () => {
    expect(gatewayFailure(403, { error: { message: 'Access denied' } })).toEqual({ status: 403, message: 'Access denied', persist: true });
    expect(gatewayFailure(402, { message: 'Add credits' })).toEqual({ status: 402, message: 'Add credits', persist: false });
  });

  it('responds with humorous Egyptian reply when user searches for unrelated topics', () => {
    const marriageRes = matchRecommendations('عايز اتجوز عروسة', null, REAL_STORES, REAL_PRODUCTS);
    expect(marriageRes.suggestions).toHaveLength(0);
    expect(marriageRes.summary).toContain('مأذون شرعي');

    const rocketRes = matchRecommendations('صاروخ فضائي للمريخ', null, REAL_STORES, REAL_PRODUCTS);
    expect(rocketRes.suggestions).toHaveLength(0);
    expect(rocketRes.summary).toContain('توكتوك');

    const dinosaurRes = matchRecommendations('عايز اشتري ديناصور واسد', null, REAL_STORES, REAL_PRODUCTS);
    expect(dinosaurRes.suggestions).toHaveLength(0);
    expect(dinosaurRes.summary).toContain('حديقة حيوانات');

    const dietRes = matchRecommendations('عايز اخس دايت عشان الكرش', null, REAL_STORES, REAL_PRODUCTS);
    expect(dietRes.suggestions).toHaveLength(0);
    expect(dietRes.summary).toContain('الكرش');

    const visaRes = matchRecommendations('عايز فيزا وسفر لكندا', null, REAL_STORES, REAL_PRODUCTS);
    expect(visaRes.suggestions).toHaveLength(0);
    expect(visaRes.summary).toContain('ترعة الإسماعيلية');

    const magicRes = matchRecommendations('فك سحر وعمل سفلي وفنجان', null, REAL_STORES, REAL_PRODUCTS);
    expect(magicRes.suggestions).toHaveLength(0);
    expect(magicRes.summary).toContain('طاجن كوارع');

    const realStoreRes = matchRecommendations('كباب وكفتة من الباز', null, REAL_STORES, REAL_PRODUCTS);
    expect(realStoreRes.suggestions.length).toBeGreaterThan(0);
  });
});