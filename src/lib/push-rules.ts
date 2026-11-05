import { z } from 'zod';

export const pushTokenInput = z.object({ token: z.string().trim().min(20).max(4096) });
export function isStalePushToken(status: number, code?: string) {
  return (status === 404 && code === 'UNREGISTERED') || (status === 400 && code === 'INVALID_ARGUMENT');
}