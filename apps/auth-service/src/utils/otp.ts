import crypto from 'crypto'
import { config } from '../config.js'

interface OtpEntry {
  hashedOtp: string
  expiresAt: Date
}

/**
 * In-memory OTP store.
 * TODO: Replace with Redis or a DB table with an `expiresAt` column
 *       for production use (this resets on every server restart).
 */
const otpStore = new Map<string, OtpEntry>()

/** Generates a cryptographically random 6-digit numeric OTP. */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Hashes and stores an OTP for the given email.
 * Any previous OTP for that email is overwritten (resend support).
 */
export async function storeOtp(email: string, otp: string): Promise<void> {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex')
  const expiresAt = new Date(Date.now() + config.OTP_EXPIRES_MINUTES * 60 * 1000)
  otpStore.set(email.toLowerCase(), { hashedOtp, expiresAt })
}

/**
 * Verifies an OTP for the given email.
 * - Returns `true` and deletes the entry on success (one-time use).
 * - Returns `false` if OTP is wrong, expired, or not found.
 * - Uses `timingSafeEqual` to prevent timing attacks.
 */
export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const entry = otpStore.get(email.toLowerCase())
  if (!entry) return false

  if (entry.expiresAt < new Date()) {
    otpStore.delete(email.toLowerCase())
    return false
  }

  const hashedInput = crypto.createHash('sha256').update(otp).digest('hex')
  const isValid = crypto.timingSafeEqual(
    Buffer.from(hashedInput, 'hex'),
    Buffer.from(entry.hashedOtp, 'hex'),
  )

  if (isValid) {
    // OTP is single-use — remove immediately after successful verify
    otpStore.delete(email.toLowerCase())
  }

  return isValid
}
