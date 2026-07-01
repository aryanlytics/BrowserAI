import 'dotenv/config'

const required = [
  'PORT',
  'SPEECHMATICS_API_KEY',
  'NODE_ENV',
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_SECRET_KEY',
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
  SPEECHMATICS_API_KEY: process.env['SPEECHMATICS_API_KEY'],
  LIVEKIT_API_KEY: process.env['LIVEKIT_API_KEY'],
  LIVEKIT_SECRET_KEY: process.env['LIVEKIT_SECRET_KEY'],
  LIVEKIT_URL: process.env['LIVEKIT_URL'],

} as const
