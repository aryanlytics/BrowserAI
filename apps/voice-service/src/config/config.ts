import 'dotenv/config'

const required = [
  'PORT',
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
  PORT:            parseInt(process.env['PORT'] ?? '4002', 10),
  NODE_ENV:        process.env['NODE_ENV'] ?? 'development',
  ALLOWED_ORIGINS: (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(','),
} as const
