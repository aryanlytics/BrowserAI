import 'dotenv/config'

// ─── Required env vars — crash immediately if missing ─────────────────────────

const required = [
  'MONGO_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'INTERNAL_SECRET',
  'ALLOWED_ORIGINS',
  'BASE_URL'

] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n[Config] ❌ Missing required env var: ${key}`)
    console.error(`[Config]    Add it to your .env file and restart\n`)
    process.exit(1)
  }
}

// ─── Config object ────────────────────────────────────────────────────────────

export const config = {
  PORT: Number(process.env.PORT) || 4001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGO_URL:    process.env.MONGO_URL!,
  REDIS_URL:    process.env.REDIS_URL!,

  // JWT
  JWT_ACCESS_SECRET:    process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET:   process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_EXPIRES:   process.env.JWT_ACCESS_EXPIRES  || '15m',
  JWT_REFRESH_EXPIRES:  process.env.JWT_REFRESH_EXPIRES || '7d',

  // OTP
  OTP_EXPIRES_MINUTES: Number(process.env.OTP_EXPIRES_MINUTES) || 10,

  // Internal secret — must match api-gateway
  INTERNAL_SECRET: process.env.INTERNAL_SECRET!,

  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:4000',
  BASE_URL: process.env.BASE_URL || 'http://localhost:4001',
} as const