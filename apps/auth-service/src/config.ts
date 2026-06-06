import 'dotenv/config'

export const config = {
  PORT: Number(process.env['PORT']) || 4001,
  NODE_ENV: process.env['NODE_ENV'] || 'development',

  // JWT
  JWT_ACCESS_SECRET: process.env['JWT_ACCESS_SECRET'] || 'dev-access-secret-change-in-production',
  JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] || 'dev-refresh-secret-change-in-production',
  JWT_ACCESS_EXPIRES_IN: (process.env['JWT_ACCESS_EXPIRES_IN'] || '15m') as string,
  JWT_REFRESH_EXPIRES_IN: (process.env['JWT_REFRESH_EXPIRES_IN'] || '7d') as string,

  // OTP
  OTP_EXPIRES_MINUTES: Number(process.env['OTP_EXPIRES_MINUTES']) || 10,

  // Internal service-to-service secret (must match api-gateway)
  INTERNAL_SECRET: process.env['INTERNAL_SECRET'] || 'dev-secret',
} as const

export type Config = typeof config
