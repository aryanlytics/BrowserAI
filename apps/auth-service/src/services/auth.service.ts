import bcrypt from 'bcryptjs'
import { generateOtp, storeOtp, verifyOtp } from '../utils/otp.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/jwt.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  fullName: string
  passwordHash: string
  isVerified: boolean
  createdAt: Date
}

export type SafeUser = Omit<User, 'passwordHash'>

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// ─── In-memory store ──────────────────────────────────────────────────────────
// TODO: Replace with Prisma + PostgreSQL (or your preferred DB).
//       Until then, data is lost on every restart.
const users = new Map<string, User>() // keyed by email
let idCounter = 1

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user
  return safe
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Register a new user and trigger OTP delivery.
   * Throws 'EMAIL_TAKEN' if the email is already registered.
   */
  async register(email: string, fullName: string, password: string): Promise<void> {
    const key = email.toLowerCase()
    if (users.has(key)) throw new Error('EMAIL_TAKEN')

    const passwordHash = await bcrypt.hash(password, 12)
    const user: User = {
      id: String(idCounter++),
      email: key,
      fullName,
      passwordHash,
      isV
      createdAt: new Date(),
    }
    users.set(key, user)

    const otp
    await storeOtp(key, otp)

    // TODO: Send via nodemailer/resend in production
    // For now, print to console so you can copy it during dev
    console.log(`\n  [DEV] OTP for ${email}: ${otp}\n`)
  

  /**
   * Verify OTP → mark user as verified → issue tokens.
   * Throws 'USER_NOT_FOUND' or 'INVALID_OTP'.
   */
  async verifyOtpAndActivate(
    email: string,
    otp: str
  ): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const key = email.toLowerCase()
    const user = users.get(key)
    if (!user) throw new Error('USER_NOT_FOUND')

    const valid = await verifyOtp(key, otp)
    if (!valid) throw new Error('INVALID_OTP')

    user.isVerified = true

    const payload = { id: user.id, email: user.email }
    const tokens: AuthTokens = {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    }
    return { tokens, user: toSafeUser(user) }
  }

  /**
   * Login with email + password → issue tokens.
   * Throws 'INVALID_CREDENTIALS' or 'EMAIL_NOT_VERIFIED'.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ tokens: AuthTokens; user: SafeUser }> {
    const key = email.toLowerCase()
    const user = users.get(key)

    // Intentionally the same error for wrong email and wrong password
    // to avoid user enumeration attacks.
    if (!user) throw new Error('INVALID_CREDENTIALS')
    if (!user.isVerified) throw new Error('EMAIL_NOT_VERIFIED')

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) throw new Error('INVALID_CREDENTIALS')

    const payload = { id: user.id, email: user.email }
    const tokens: AuthTokens = {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    }
    return { tokens, user: toSafeUser(user) }
  }

  /**
   * Use a valid refresh token to mint a new access token.
   * Throws if the refresh token is invalid or expired.
   */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken) // throws if invalid
    const accessToken = signAccessToken({ id: payload.id, email: payload.email })
    return { accessToken }
  }

  /**
   * Validate an access token and return the decoded user payload.
   * Called internally by the API Gateway.
   * Throws if the token is invalid or expired.
   */
  validate(token: string): { user: { id: string; email: string } } {
    const { id, email } = verifyAccessToken(token) // throws if invalid
    return { user: { id, email } }
  }

  /**
   * Get a user by their ID (for GET /auth/me).
   * Returns null if not found.
   */
  getMe(id: string): SafeUser | null {
    for (const user of users.values()) {
      if (user.id === id) return toSafeUser(user)
    }
    return null
  }
}

export const authService = new AuthService()
