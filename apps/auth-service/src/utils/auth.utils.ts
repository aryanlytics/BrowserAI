import { scryptSync, randomBytes, timingSafeEqual, randomInt } from 'crypto'

/**
 * Hashes a plaintext password using crypto.scryptSync and returns a salt:hash string.
 * Uses a cryptographically secure 16-byte random salt.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verifies a plaintext password against a stored salt:hash string.
 * Optimised to avoid unnecessary string-to-buffer and buffer-to-string conversions,
 * and handles length mismatch securely without throwing runtime errors.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':')
    if (parts.length !== 2) return false

    const [salt, hash] = parts
    if (!salt || !hash) return false

    const hashBuffer = Buffer.from(hash, 'hex')
    const candidateHashBuffer = scryptSync(password, salt, 64)

    if (hashBuffer.length !== candidateHashBuffer.length) {
      return false
    }

    return timingSafeEqual(hashBuffer, candidateHashBuffer)
  } catch {
    return false
  }
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 */
export function generateOtp(): string {
  return randomInt(100000, 1000000).toString()
}
