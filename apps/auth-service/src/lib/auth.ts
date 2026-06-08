import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import mongoose from 'mongoose'
import { config } from '../config/config.js'
import { Resend } from 'resend'

const resend = new Resend(config.RESEND_API_KEY)



export const auth = betterAuth({
  // ── Core ──────────────────────────────────────────────────────────────────
  baseURL: config.BASE_URL,
  secret: config.BETTER_AUTH_SECRET,

  // ── Database ──────────────────────────────────────────────────────────────
  // Better Auth creates these MongoDB collections automatically:
  // users, sessions, accounts, verifications
  database: mongodbAdapter(mongoose.connection.db!),

  // ── Email + Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },

  // ── Email Verification ────────────────────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Verify your email',
      html: `
        <div style="font-family: sans-serif">
          <h2>Email Verification</h2>
          <p>Click the link below to verify your email:</p>
          <a href="${url}" target="_blank">
            Verify Email
          </a>
          <p style="margin-top: 12px; color: gray;">
            This link expires in 10 minutes.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[Resend] Failed to send email:', err)
    throw new Error('Email verification failed')
  }
},

    sendOnSignUp: true,
    expiresIn: 600, // 10 minutes
  },

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,         // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                // cache in cookie for 5 min
    },
  },

  // ── Trusted origins ───────────────────────────────────────────────────────
  // Only api-gateway should be calling auth-service
  trustedOrigins: [config.ALLOWED_ORIGINS],
})