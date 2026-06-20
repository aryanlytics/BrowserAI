import 'dotenv/config'

const required = [
  'PORT',
  'SPEECHMATICS_API_KEY'
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
  SPEECHMATICS_API_KEY: process.env['SPEECHMATICS_API_KEY']

} as const
