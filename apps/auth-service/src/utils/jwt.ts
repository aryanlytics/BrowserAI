import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export interface JwtPayload {
  id: string
  email: string
}

/**
 * Sign a short-lived access token (default: 15 minutes).
 * Sent as an httpOnly cookie on every authenticated request.
 */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/**
 * Sign a long-lived refresh token (default: 7 days).
 * Sent as an httpOnly cookie scoped to /auth/refresh.
 */
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/**
 * Verify and decode an access token.
 * Throws if the token is expired or has an invalid signature.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload
}

/**
 * Verify and decode a refresh token.
 * Throws if the token is expired or has an invalid signature.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload
}
