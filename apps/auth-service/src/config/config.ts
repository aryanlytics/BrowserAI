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

  // Origins trusted by Better Auth for CSRF checks.
  // Only the browser's Origin header matters here — the gateway (4001→4000)
  // is a server-to-server call and never sends an Origin header.
  // Comma-separated in .env → parsed into string[] here.
  ALLOWED_ORIGINS: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),

  // The PUBLIC URL clients use to reach Better Auth (via the gateway).
  // Used to build email verification links and for CSRF origin checks.
  // Must NOT be the internal service address (4001).
  BASE_URL: process.env.BASE_URL || 'http://localhost:4000',
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  
} as const