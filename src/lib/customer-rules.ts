import { z } from 'zod';
import type { RequestKind } from './dashboard-rules';

export const contactInput = z.object({
  address: z.string().trim().min(3, 'أدخل العنوان بالتفصيل').max(500),
  phone: z.string().trim().min(6, 'أدخل رقم الهاتف').max(25),
  area_id: z.number().int().positive().nullable(),
  notes: z.string().max(2000).default(''),
});

export const checkoutInput = contactInput.extend({
  store_id: z.string().uuid(),
  items: z.array(
    z.object({
      product_id: z.string().min(1, 'معرف المنتج مطلوب'),
      qty: z.number().int().min(1).max(99),
    }),
  ).min(1),
});

export const bookingInput = z.object({
  store_id: z.string().uuid(),
  patient_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(25),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  booking_time: z.string(),
  notes: z.string().max(2000).default(''),
});

export const serviceInput = contactInput.extend({
  store_id: z.string().uuid(),
  description: z.string().trim().min(5).max(2000),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  image_paths: z.array(z.string()).max(5).default([]),
});

export function canCustomerCancel(kind: RequestKind, status: string) {
  return kind === 'bookings' ? ['pending', 'confirmed'].includes(status) : status === 'pending';
}
