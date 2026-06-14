import 'dotenv/config'

const required = [
  'NEXT_PUBLIC_API_GATEWAY_URL'
] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n[Config] ❌ Missing required env var: ${key}`)
    console.error(`[Config]    Add it to your .env file and restart\n`)
    process.exit(1)
  }
}

export const config = {
  NEXT_PUBLIC_API_GATEWAY_URL: process.env.NEXT_PUBLIC_API_GATEWAY_URL!,
  
} as const