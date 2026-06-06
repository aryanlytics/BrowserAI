import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { authService } from '../services/auth.service.js'
import { setTokenCookies, clearTokenCookies } from '../utils/cookie.js'
import { config } from '../config.js'

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

// ─── Routes ───────────────────────────────────────────────────────────────────

const authRoutes: FastifyPluginAsync = async (fastify) => {

  /**
   * POST /auth/register
   * Creates a new unverified user and sends an OTP to their email.
   */
  fastify.post('/auth/register', async (request, reply) => {
    const result = registerSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        details: result.error.issues,
      })
    }

    const { email, fullName, password } = result.data
    try {
      await authService.register(email, fullName, password)
      return reply.status(201).send({
        message: 'Registration successful. Check your email for the OTP.',
      })
    } catch (err) {
      if (err instanceof Error && err.message === 'EMAIL_TAKEN') {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'An account with this email already exists',
        })
      }
      throw err
    }
  })

  /**
   * POST /auth/verify-otp
   * Verifies the OTP, activates the account, and issues auth cookies.
   */
  fastify.post('/auth/verify-otp', async (request, reply) => {
    const result = verifyOtpSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        details: result.error.issues,
      })
    }

    const { email, otp } = result.data
    try {
      const { tokens, user } = await authService.verifyOtpAndActivate(email, otp)
      setTokenCookies(reply, tokens.accessToken, tokens.refreshToken)
      return reply.send({ user })
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'USER_NOT_FOUND') {
          return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' })
        }
        if (err.message === 'INVALID_OTP') {
          return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'Invalid or expired OTP' })
        }
      }
      throw err
    }
  })

  /**
   * POST /auth/login
   * Authenticates a verified user and issues auth cookies.
   */
  fastify.post('/auth/login', async (request, reply) => {
    const result = loginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        details: result.error.issues,
      })
    }

    const { email, password } = result.data
    try {
      const { tokens, user } = await authService.login(email, password)
      setTokenCookies(reply, tokens.accessToken, tokens.refreshToken)
      return reply.send({ user })
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'INVALID_CREDENTIALS') {
          return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid email or password' })
        }
        if (err.message === 'EMAIL_NOT_VERIFIED') {
          return reply.status(403).send({ statusCode: 403, error: 'Forbidden', message: 'Please verify your email first' })
        }
      }
      throw err
    }
  })

  /**
   * POST /auth/refresh
   * Uses the `refreshToken` cookie to issue a fresh `accessToken` cookie.
   */
  fastify.post('/auth/refresh', async (request, reply) => {
    const refreshToken = request.cookies['refreshToken']
    if (!refreshToken) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No refresh token provided' })
    }

    try {
      const { accessToken } = await authService.refresh(refreshToken)
      reply.setCookie('accessToken', accessToken, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60,
      })
      return reply.send({ message: 'Access token refreshed' })
    } catch {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired refresh token' })
    }
  })

  /**
   * POST /auth/logout
   * Clears both auth cookies.
   */
  fastify.post('/auth/logout', async (_request, reply) => {
    clearTokenCookies(reply)
    return reply.send({ message: 'Logged out successfully' })
  })

  /**
   * GET /auth/me
   * Returns the currently authenticated user.
   * Reads the accessToken cookie directly (this endpoint is NOT behind the gateway's auth middleware).
   */
  fastify.get('/auth/me', async (request, reply) => {
    const token = request.cookies['accessToken']
    if (!token) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No access token provided' })
    }

    try {
      const { user: payload } = authService.validate(token)
      const user = authService.getMe(payload.id)
      if (!user) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'User not found' })
      }
      return reply.send({ user })
    } catch {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired token' })
    }
  })

  /**
   * POST /auth/validate  ← INTERNAL — called only by the API Gateway
   * Validates an access token and returns the decoded user payload.
   * Protected by the x-internal-secret header.
   */
  fastify.post('/auth/validate', async (request, reply) => {
    // Guard: only the gateway (or services that know the secret) can call this
    if (request.headers['x-internal-secret'] !== config.INTERNAL_SECRET) {
      return reply.status(403).send({ statusCode: 403, error: 'Forbidden' })
    }

    const body = request.body as Record<string, unknown>
    const token = typeof body['token'] === 'string' ? body['token'] : null
    if (!token) {
      return reply.status(400).send({ statusCode: 400, error: 'Bad Request', message: 'token is required' })
    }

    try {
      const result = authService.validate(token)
      return reply.send(result) // { user: { id, email } }
    } catch {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired token' })
    }
  })
}

export default authRoutes
