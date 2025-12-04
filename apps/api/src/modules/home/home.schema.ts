import { z } from 'zod';

export const updateHomeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
});

export type UpdateHomeInput = z.infer<typeof updateHomeSchema>;
