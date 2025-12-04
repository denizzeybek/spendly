import { z } from 'zod';

export const createLoanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  totalAmount: z.number().positive('Total amount must be positive'),
  principalAmount: z.number().positive('Principal amount must be positive'),
  monthlyPayment: z.number().positive('Monthly payment must be positive'),
  totalInstallments: z.number().int().min(1, 'Total installments must be at least 1'),
  paidInstallments: z.number().int().min(0).default(0),
  startDate: z.string().or(z.date()), // ISO date string or Date
  interestRate: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export const updateLoanSchema = createLoanSchema.partial();

export const payInstallmentSchema = z.object({
  count: z.number().int().min(1).default(1), // Number of installments to mark as paid
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
export type PayInstallmentInput = z.infer<typeof payInstallmentSchema>;
