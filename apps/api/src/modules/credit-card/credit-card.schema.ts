import { z } from 'zod';

export const createCreditCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  billingDate: z.string().or(z.date()).optional(), // ISO date string or Date, defaults to first of current month
});

export const updateCreditCardSchema = createCreditCardSchema.partial();

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
