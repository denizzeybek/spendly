import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  homeName: z.string().min(2, 'Home name must be at least 2 characters').optional(),
  homeCode: z.string().length(6, 'Home code must be 6 characters').optional(),
}).refine(
  (data) => data.homeName || data.homeCode,
  { message: 'Either homeName (to create new) or homeCode (to join) is required' }
);

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const joinHomeSchema = z.object({
  homeCode: z.string().length(6, 'Home code must be 6 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type JoinHomeInput = z.infer<typeof joinHomeSchema>;
