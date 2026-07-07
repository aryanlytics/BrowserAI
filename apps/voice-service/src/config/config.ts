import 'dotenv/config'

const required = [
  'PORT',
  'NODE_ENV',
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_SECRET_KEY',
  'GEMINI_GRPC_URL',
] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n[Config] ❌ Missing required env var: ${key}`)
    console.error(`[Config]    Add it to your .env file and restart\n`)
    process.exit(1)
  }
}

export const config = {
  PORT:              parseInt(process.env['PORT'] ?? '4002', 10),
  NODE_ENV:          process.env['NODE_ENV'] ?? 'development',
  LIVEKIT_URL:       process.env['LIVEKIT_URL']!,
  LIVEKIT_API_KEY:   process.env['LIVEKIT_API_KEY']!,
  LIVEKIT_SECRET_KEY: process.env['LIVEKIT_SECRET_KEY']!,
  GEMINI_GRPC_URL:   process.env['GEMINI_GRPC_URL'] ?? 'localhost:50051',
} as const
