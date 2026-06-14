import { z } from 'zod'

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(30, 'Full name must be less than 30 characters'),

  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string()
    .trim()
    .min(8,  'Password must be at least 8 characters')
    .regex(/[A-Z]/,        'Password must contain at least one uppercase letter')
    .regex(/[a-z]/,        'Password must contain at least one lowercase letter')
    .regex(/[0-9]/,        'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .toLowerCase(),

  otp: z
    .string()
    .trim()
    .length(6,          'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/,   'OTP must contain only numbers'),
})

// ─── Login ────────────────────────────────────────────────────────────────────
// No password rules on login — only check it's not empty.
// The user's password might predate stricter rules.

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),

  password: z
    .string()
    .min(1, 'Password is required'),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegisterInput  = z.infer<typeof registerSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type LoginInput     = z.infer<typeof loginSchema>