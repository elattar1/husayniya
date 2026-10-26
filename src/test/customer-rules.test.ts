import { describe, expect, it } from 'vitest';
import { canCustomerCancel, checkoutInput } from '@/lib/customer-rules';
import { earnings } from '@/lib/dashboard-rules';
describe('Customer cancellation follows database guards', () => {
  it('allows purchase cancellation only while pending', () => { expect(canCustomerCancel('orders','pending')).toBe(true); expect(canCustomerCancel('orders','accepted')).toBe(false); });
  it('allows pending and confirmed booking cancellation but not completed', () => { expect(canCustomerCancel('bookings','pending')).toBe(true); expect(canCustomerCancel('bookings','confirmed')).toBe(true); expect(canCustomerCancel('bookings','completed')).toBe(false); });
  it('allows home service cancellation only while pending', () => { expect(canCustomerCancel('service_requests','pending')).toBe(true); expect(canCustomerCancel('service_requests','in_progress')).toBe(false); });
  it('requires nonempty checkout items', () => { expect(checkoutInput.safeParse({store_id:'00000000-0000-4000-8000-000000000001',items:[],address:'عنوان اختباري',phone:'01000000000',area_id:1,notes:''}).success).toBe(false); });
  it('counts only completed operations for dashboard earnings', () => { expect(earnings([{kind:'orders',status:'pending',amount:100,commission:10,created_at:'2026-10-26',store_id:'1'},{kind:'orders',status:'delivered',amount:200,commission:20,created_at:'2026-10-26',store_id:'1'}])).toEqual({gross:200,commission:20,net:180,count:1}); });
});
