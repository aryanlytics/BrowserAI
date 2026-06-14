import type { FastifyPluginAsync } from 'fastify'
import { User } from '../schema/mongo/user.model.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { generateOtp } from '../utils/otp.js'
import { createSession, deleteSession, validateSession } from '../utils/session.js'
import { registerSchema, verifyOtpSchema, loginSchema } from '../schema/zod/auth.js'
import { redis } from '../config/database.js'
import { Resend } from 'resend'
import { config } from '../config/config.js'

const resend = new Resend(config.RESEND_API_KEY)

const authRoutes: FastifyPluginAsync = async (fastify) => {

  // ─── Sign Up ───────────────────────────────────────────────────────────────
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
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'An account with this email already exists.',
        })
      }

      const passwordHash = hashPassword(password)
      await User.create({ name: fullName, email, passwordHash, emailVerified: false })

      // Generate OTP — expires in 2 minutes
      const otp = generateOtp()
      await redis.set(`otp:${email}`, otp, 'EX', 120)

      // Send email
      try {
        await resend.emails.send({
          from:    'onboarding@resend.dev',
          to:      email,
          subject: 'Verify your email — BrowserAI',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
              <h2 style="margin-bottom:8px;">Verify your email</h2>
              <p>Your verification code:</p>
              <h1 style="color:#2563eb;letter-spacing:6px;font-size:36px;margin:16px 0;">${otp}</h1>
              <p style="color:#888;font-size:13px;">Expires in 2 minutes. If you didn't request this, ignore this email.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        request.log.error(emailErr, 'Failed to send verification email')
        // Don't fail signup if email fails — OTP is still in Redis
      }

      return reply.status(201).send({
        success: true,
        message: 'Account created. Check your email for the verification code.',
      })
    } catch (err) {
      request.log.error(err, 'Sign up error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to process registration.',
      })
    }
  })

  // ─── Verify OTP ────────────────────────────────────────────────────────────
  fastify.post('/api/auth/verifyotp', async (request, reply) => {
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
      if (!storedOtp || storedOtp !== otp) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid or expired verification code.',
        })
      }

      const user = await User.findOneAndUpdate(
        { email },
        { emailVerified: true },
        { new: true },
      )

      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found.',
        })
      }

      await redis.del(`otp:${email}`)

      // Create session — extract only what's needed
      try {
        await createSession(
          user._id.toString(),
          request.ip,
          request.headers['user-agent'] || 'unknown',
          reply,
        )
      } catch (sessionErr) {
        request.log.error(sessionErr, 'Failed to create session after OTP verify')
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Account verified but failed to create session. Please log in.',
        })
      }

      return reply.status(200).send({
        success: true,
        message: 'Email verified. You are now logged in.',
      })
    } catch (err) {
      request.log.error(err, 'Verify OTP error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to verify OTP.',
      })
    }
  })

  // ─── Logout ────────────────────────────────────────────────────────────────
  fastify.post('/api/auth/logout', async (request, reply) => {
    const token = request.cookies['sessionToken']

    if (token) {
      await deleteSession(token, reply)
    }

    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully.',
    })
  })


  // ─── Login ─────────────────────────────────────────────────────────────────
  fastify.post('/api/auth/signin', async (request, reply) => {
    const result = loginSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: result.error.issues[0]?.message || 'Invalid login details',
      })
    }

    const { email, password } = result.data

    try {
      const user = await User.findOne({ email }).select('+passwordHash')

      // Same error for wrong email and wrong password — prevents user enumeration
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email or password.',
        })
      }

      if (!user.emailVerified) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Please verify your email before logging in.',
        })
      }

      // Create session — extract only what's needed
      try {
        await createSession(
          user._id.toString(),
          request.ip,
          request.headers['user-agent'] || 'unknown',
          reply,
        )
      } catch (sessionErr) {
        request.log.error(sessionErr, 'Failed to create session after login')
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to create session. Please try again.',
        })
      }

      return reply.status(200).send({
        success: true,
        message: 'Logged in successfully.',
      })
    } catch (err) {
      request.log.error(err, 'Login error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to process login.',
      })
    }
  })


  // ─── Resend OTP ────────────────────────────────────────────────────────────
  fastify.post('/api/auth/resendotp', async (request, reply) => {
    const { email } = request.body as { email?: string }

    if (!email || typeof email !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Email is required.',
      })
    }

    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() })

      if (!user) {
        // Return 200 to prevent user enumeration
        return reply.status(200).send({
          success: true,
          message: 'If an account with that email exists, a new code has been sent.',
        })
      }

      if (user.emailVerified) {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'This email is already verified. Please sign in.',
        })
      }

      // Generate a fresh OTP and reset the 2-minute TTL
      const otp = generateOtp()
      await redis.set(`otp:${email}`, otp, 'EX', 120)

      // Resend email
      try {
        await resend.emails.send({
          from:    'onboarding@resend.dev',
          to:      email,
          subject: 'New verification code — BrowserAI',
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
              <h2 style="margin-bottom:8px;">New verification code</h2>
              <p>Your new verification code:</p>
              <h1 style="color:#2563eb;letter-spacing:6px;font-size:36px;margin:16px 0;">${otp}</h1>
              <p style="color:#888;font-size:13px;">Expires in 2 minutes. If you didn't request this, ignore this email.</p>
            </div>
          `,
        })
      } catch (emailErr) {
        request.log.error(emailErr, 'Failed to resend verification email')
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to send verification email. Please try again.',
        })
      }

      return reply.status(200).send({
        success: true,
        message: 'A new verification code has been sent to your email.',
      })
    } catch (err) {
      request.log.error(err, 'Resend OTP error')
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Failed to resend OTP.',
      })
    }
  })


   // ─── Dashboard ─────────────────────────────────────────────────────────────────

  fastify.get('/api/auth/dashboard', async (request, reply) => {
  const session = await validateSession(request, reply)

  if (!session) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Not authenticated.',
    })
  }

  const user = await User.findById(session.userId)
  if (!user) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found.',
    })
  }

  return reply.status(200).send({
    success: true,
    user: {
      id:            user._id,
      name:          user.name,
      email:         user.email,
      emailVerified: user.emailVerified,
    },
  })
})
}

export default authRoutes