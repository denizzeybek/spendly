import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  title: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().transform((str) => new Date(str)),
  categoryId: z.string().min(1, 'Category is required'),
  assignedCardId: z.string().optional(),
  isShared: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringDay: z.number().min(1).max(31).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const listTransactionsQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().optional(),
  month: z.string().transform(Number).optional(),
  year: z.string().transform(Number).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
