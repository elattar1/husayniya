import { describe, expect, it } from 'vitest';
import { pushTokenInput, isStalePushToken } from '../lib/push-rules';
describe('push delivery rules', () => {
  it('rejects a missing device token', () => { expect(pushTokenInput.safeParse({ token: '' }).success).toBe(false); });
  it('removes unregistered tokens, not temporary failures', () => {
    expect(isStalePushToken(404, 'UNREGISTERED')).toBe(true);
    expect(isStalePushToken(429, 'RESOURCE_EXHAUSTED')).toBe(false);
    expect(isStalePushToken(503, 'UNAVAILABLE')).toBe(false);
  });
  it('removes invalid device tokens', () => { expect(isStalePushToken(400, 'INVALID_ARGUMENT')).toBe(true); });
});