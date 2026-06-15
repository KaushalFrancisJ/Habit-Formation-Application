import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine((val) => (val.match(/[0-9]/g) ?? []).length >= 2, {
    message: 'Password must contain at least 2 numbers',
  })
  .refine((val) => /[^a-zA-Z0-9]/.test(val), {
    message: 'Password must contain at least 1 special character',
  });

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: passwordSchema,
  timezone: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  timezone: z.string().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
