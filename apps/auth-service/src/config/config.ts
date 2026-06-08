import 'dotenv/config'

const required = [
  'MONGO_URL',
  'REDIS_URL',
  'BETTER_AUTH_SECRET',
  'ALLOWED_ORIGINS',
  'BASE_URL',
  'RESEND_API_KEY',
] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n[Config] ❌ Missing required env var: ${key}`)
    console.error(`[Config]    Add it to your .env file and restart\n`)
    process.exit(1)
  }
}

export const config = {
  PORT: Number(process.env.PORT) || 4001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGO_URL: process.env.MONGO_URL!,
  REDIS_URL: process.env.REDIS_URL!,

  // Better Auth — replaces all JWT config
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,

  // CORS — only api-gateway should talk to auth-service
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:4000',

  // This service's own URL — Better Auth needs it
  BASE_URL: process.env.BASE_URL || 'http://localhost:4001',
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  
} as const