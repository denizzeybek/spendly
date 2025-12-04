import { z } from 'zod';

export const createCreditCardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  billingDay: z.number().min(1).max(31).default(1),
});

export const updateCreditCardSchema = createCreditCardSchema.partial();

export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;
