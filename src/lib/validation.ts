import { z } from 'zod';

export const orderItemInputSchema = z.object({
  menuItemId: z.string().cuid(),
  quantity: z.number().int().min(1).max(999)
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(5).max(30),
  note: z.string().max(500).optional().or(z.literal('')),
  items: z.array(orderItemInputSchema).min(1)
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING','CONFIRMED','FULFILLED','CANCELED'])
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
