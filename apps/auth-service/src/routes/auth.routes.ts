import type { FastifyPluginAsync } from 'fastify'
import { randomBytes } from 'crypto'
import { config } from '../config/config.js'
import { User } from '../schema/mongo/user.model.js'
import { Session } from '../schema/mongo/session.model.js'
import { redis } from '../config/database.js'
import { hashPassword, verifyPassword, generateOtp } from '../utils/auth.utils.js'
import { registerSchema, verifyOtpSchema, loginSchema } from '../schema/zod/models.js'
import { Resend } from 'resend'

const resend = new Resend(config.RESEND_API_KEY)

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── Service Validation (Internal) ─────────────────────────────────────────
  // Called by the Gateway to check if a session token is valid.
  fastify.post('/auth/validate', async (request, reply) => {
    // 1. Verify internal secret
    const internalSecret = request.headers['x-internal-secret']
    if (internalSecret !== config.INTERNAL_SECRET) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid internal secret',
      })
    }

    // 2. Extract token from request body
    const body = request.body as { token?: string }
    const token = body?.token
    if (!token) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'No token provided',
      })
    }

    try {
      // 3. Query Custom Session
      const session = await Session.findOne({ token }).populate('userId')

      if (!session || session.expiresAt < new Date()) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired session',
        })
      }

      const user = session.userId as any
      if (!user) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'User associated with session not found',
        })
      }

      // 4. Return user info
      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      }
    } catch (err) {
      request.log.error(err, 'Failed to validate session token')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to validate session token',
      })
    }
  })

  // ─── Sign Up Route ────────────────────────────────────────────────────────
  fastify.post('/api/auth/signup', async (request, reply) => {
    const result = registerSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: result.error.issues[0]?.message || 'Invalid registration details',
      })
    }

    const { fullName, email, password } = result.data

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'A user with this email address already exists.',
        })
      }

      // Hash password and save user
      const passwordHash = hashPassword(password)
      const user = await User.create({
        name: fullName,
        email,
        passwordHash,
        emailVerified: false,
      })

      // Generate OTP and cache it in Redis (2 minutes)
      const otp = generateOtp()
      await redis.set(`otp:${email}`, otp, 'EX', 120)

      console.log(`[OTP Verification] 🔑 Email: ${email} | Generated OTP: ${otp}`)

      // Send Verification Email
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Verify your email',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2>Email Verification</h2>
              <p>Your 6-digit verification code is:</p>
              <h1 style="color: #2563eb; letter-spacing: 4px; font-size: 32px; margin: 20px 0;">${otp}</h1>
              <p style="color: #666; font-size: 14px;">This code will expire in 2 minutes.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        request.log.error(emailErr, 'Failed to send verification email via Resend')
      }

      return reply.status(201).send({
        success: true,
        message: 'Account registered successfully. Verification email sent.',
        email,
      })
    } catch (err) {
      request.log.error(err, 'Sign up error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to process registration',
      })
    }
  })

  // ─── Verify OTP Route ──────────────────────────────────────────────────────
  fastify.post('/api/auth/verify-otp', async (request, reply) => {
    const result = verifyOtpSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: result.error.issues[0]?.message || 'Invalid verification details',
      })
    }

    const { email, otp } = result.data

    try {
      const storedOtp = await redis.get(`otp:${email}`)
      if (!storedOtp || storedOtp !== otp.toString()) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid or expired verification code.',
        })
      }

      // Mark user as verified
      const user = await User.findOneAndUpdate(
        { email },
        { emailVerified: true },
        { new: true }
      )

      if (!user) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'User not found.',
        })
      }

      // Clear the OTP from cache
      await redis.del(`otp:${email}`)

      // Create session
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await Session.create({ userId: user._id, token, expiresAt })

      // Set cookie
      reply.setCookie('accessToken', token, {
        path: '/',
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      })

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      }
    } catch (err) {
      request.log.error(err, 'Verification OTP error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to verify OTP',
      })
    }
  })

  // ─── Sign In Route ─────────────────────────────────────────────────────────
  fastify.post('/api/auth/signin', async (request, reply) => {
    const result = loginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: result.error.issues[0]?.message || 'Invalid sign-in details',
      })
    }

    const { email, password } = result.data

    try {
      const user = await User.findOne({ email })
      if (!user) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid email or password.',
        })
      }

      const isPasswordValid = verifyPassword(password, user.passwordHash)
      if (!isPasswordValid) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid email or password.',
        })
      }

      if (!user.emailVerified) {
        // Generate a new OTP so they can complete registration
        const otp = generateOtp()
        await redis.set(`otp:${email}`, otp, 'EX', 600)
        console.log(`[OTP Verification] 🔑 Email: ${email} | Generated OTP: ${otp}`)

        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify your email',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2>Email Verification Needed</h2>
                <p>Your account is not verified yet. Your 6-digit verification code is:</p>
                <h1 style="color: #2563eb; letter-spacing: 4px; font-size: 32px; margin: 20px 0;">${otp}</h1>
                <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
              </div>
            `,
          })
        } catch (emailErr) {
          request.log.error(emailErr, 'Failed to send email verification via Resend')
        }

        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address. A code has been sent to your inbox.',
          email,
        })
      }

      // Create session
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await Session.create({ userId: user._id, token, expiresAt })

      // Set cookie
      reply.setCookie('accessToken', token, {
        path: '/',
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      })

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      }
    } catch (err) {
      request.log.error(err, 'Sign in error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during sign in',
      })
    }
  })

  // ─── Sign Out Route ────────────────────────────────────────────────────────
  fastify.post('/api/auth/signout', async (request, reply) => {
    const token = request.cookies['accessToken']

    try {
      if (token) {
        await Session.deleteOne({ token })
      }

      reply.clearCookie('accessToken', {
        path: '/',
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      return {
        success: true,
        message: 'Signed out successfully',
      }
    } catch (err) {
      request.log.error(err, 'Sign out error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred during sign out',
      })
    }
  })

  // ─── Resend OTP Route ──────────────────────────────────────────────────────
  fastify.post('/api/auth/resend-otp', async (request, reply) => {
    const body = request.body as { email?: string }
    const email = body?.email
    if (!email) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Email is required',
      })
    }

    try {
      const user = await User.findOne({ email })
      if (!user) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'User not found',
        })
      }

      const otp = generateOtp()
      await redis.set(`otp:${email}`, otp, 'EX', 600)

      console.log(`[OTP Verification] 🔑 Email: ${email} | Resent OTP: ${otp}`)

      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email,
          subject: 'Verify your email',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2>Email Verification</h2>
              <p>Your new 6-digit verification code is:</p>
              <h1 style="color: #2563eb; letter-spacing: 4px; font-size: 32px; margin: 20px 0;">${otp}</h1>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        request.log.error(emailErr, 'Failed to send verification email via Resend')
      }

      return {
        success: true,
        message: 'Verification code resent successfully.',
      }
    } catch (err) {
      request.log.error(err, 'Resend OTP error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to resend verification code',
      })
    }
  })
}

export default authRoutes
