import { z } from 'zod';

export const recommendationInput = z.object({
  description: z.string().trim().min(5, 'اكتب وصفًا أوضح للخدمة المطلوبة').max(1500, 'الوصف طويل جدًا؛ اختصره إلى 1500 حرف'),
  area_id: z.number().int().positive().nullable(),
});
export const recommendationOutput = z.object({
  summary: z.string(),
  suggestions: z.array(z.object({ store_id: z.string(), reason: z.string() }).strict()),
}).strict();
export type RecommendationOutput = z.infer<typeof recommendationOutput>;
export function groundRecommendations(output: RecommendationOutput, eligibleIds: readonly string[]) {
  const eligible = new Set(eligibleIds);
  const seen = new Set<string>();
  return {
    summary: output.summary.slice(0, 500),
    suggestions: output.suggestions.filter(s => {
      if (!eligible.has(s.store_id) || seen.has(s.store_id)) return false;
      seen.add(s.store_id);
      return true;
    }).slice(0, 3).map(s => ({ store_id: s.store_id, reason: s.reason.slice(0, 300) })),
  };
}

export function gatewayFailure(status: number, body: unknown) {
  const parsed = z.object({ message: z.string().optional(), error: z.union([z.string(), z.object({ message: z.string().optional() }).passthrough()]).optional() }).passthrough().safeParse(body);
  const value = parsed.success ? parsed.data : undefined;
  const message = value?.message || (typeof value?.error === 'string' ? value.error : value?.error?.message);
  return { status, message: message || 'تعذر الحصول على الاقتراحات الآن؛ حاول لاحقًا', persist: status === 403 };
}