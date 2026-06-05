import 'dotenv/config'

export const config = {
  PORT: Number(process.env['PORT']) || 4000,
  NODE_ENV: process.env['NODE_ENV'] || 'development',

  // Downstream services
  AUTH_SERVICE_URL: process.env['AUTH_SERVICE_URL'] || 'http://localhost:4001',

  // CORS
  ALLOWED_ORIGINS: (process.env['ALLOWED_ORIGINS'] || 'http://localhost:3000').split(','),

  // Internal service-to-service shared secret
  INTERNAL_SECRET: process.env['INTERNAL_SECRET'] || 'dev-secret',
} as const

export type Config = typeof config
