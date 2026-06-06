import { z } from 'zod'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  otp: z.string().trim().min(6, 'OTP must be 6 digits').transform(val => Number(val))
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().trim().min(8, 'Password is required'),
})

export { registerSchema, verifyOtpSchema, loginSchema }