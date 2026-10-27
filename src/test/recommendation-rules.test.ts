import { describe, expect, it } from 'vitest';
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
});