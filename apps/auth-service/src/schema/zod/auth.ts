import { z } from 'zod'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  fullName: z.string().trim().min(2),

  email: z.string().email().trim(),

  password: z
    .string()
    .min(8)
    .trim()
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
});


const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address"),

  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().trim().min(8, 'Password is required'),
})

export { registerSchema, verifyOtpSchema, loginSchema }