import type { FastifyReply } from 'fastify'
import { config } from '../config/config.js'

const IS_PROD = config.NODE_ENV === 'production'

/**
 * Sets both httpOnly token cookies on the reply.
 *
 * - `accessToken` — scoped to `/`, expires in 15 min
 * - `refreshToken` — scoped to `/auth/refresh`, expires in 7 days
 *
 * The path restriction on refreshToken means the browser will ONLY
 * send it to the refresh endpoint, not on every request.
 */
export function setTokenCookies(
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
): void {
  reply.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60, // 15 minutes in seconds
  })

  reply.setCookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })
}

/** Clears both token cookies (used on logout). */
export function clearTokenCookies(reply: FastifyReply): void {
  reply.clearCookie('accessToken', { path: '/' })
  reply.clearCookie('refreshToken', { path: '/auth/refresh' })
}
