import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'), // The name in the current language
  lang: z.enum(['tr', 'en']).default('tr'), // Current language for translation
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  type: z.enum(['INCOME', 'EXPENSE', 'BOTH']),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(), // Update name in the specified language
  lang: z.enum(['tr', 'en']).optional(), // Language of the name being updated
  icon: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  type: z.enum(['INCOME', 'EXPENSE', 'BOTH']).optional(),
});

export const listCategoriesQuerySchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'BOTH']).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
