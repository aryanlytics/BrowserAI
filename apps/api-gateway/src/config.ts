import 'dotenv/config'

const required = [
  'INTERNAL_SECRET',
  'AUTH_SERVICE_URL',
  'ALLOWED_ORIGINS',
] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n[Config] ❌ Missing required env var: ${key}`)
    console.error(`[Config]    Add it to your .env file and restart\n`)
    process.exit(1)
  }
}

export const config = {
  PORT: Number(process.env.PORT) || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Downstream services
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',

  // CORS — comma-separated origins in .env
  // e.g. ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // Internal service-to-service secret — must match auth-service
  INTERNAL_SECRET: process.env.INTERNAL_SECRET!,
} as const
