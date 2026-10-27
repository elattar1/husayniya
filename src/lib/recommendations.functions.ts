import { createServerFn } from '@tanstack/react-start';
import { getRequest, setResponseStatus } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { recommendationInput } from './recommendation-rules';

export const recommendServices = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(recommendationInput)
  .handler(async ({ data, context }) => {
    const { recommendFromCatalog } = await import('./recommendations.server');
    const result = await recommendFromCatalog(data, context.supabase, getRequest());
    if (!result.ok) setResponseStatus(result.status);
    return result;
  });