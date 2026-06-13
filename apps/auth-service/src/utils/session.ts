import { randomBytes } from 'crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { Session } from '../schema/mongo/session.model.js'
import { config } from '../config/config.js'

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

// ─── Create a new session ─────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  ip: string,
  userAgent: string,
  reply: FastifyReply,
): Promise<void> {
  const token     = randomBytes(32).toString('hex')
  const ipAddress = ip || 'unknown'
  const agent     = userAgent || 'unknown'
  const expiresAt = new Date(Date.now() + SESSION_TTL)

  await Session.create({ userId, token, ipAddress, userAgent: agent, expiresAt })

  reply.setCookie('sessionToken', token, {
    path:     '/',
    httpOnly: true,
    secure:   config.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_COOKIE_MAX_AGE,
  })
}

// ─── Validate session on every protected request ──────────────────────────────
// Checks:
//   1. Cookie exists
//   2. Session exists in DB and is not expired
//   3. IP matches (prevents stolen cookie from different network)
//   4. Extends session TTL if active (sliding expiry)

export async function validateSession(request: FastifyRequest): Promise<{
  userId: string
  sessionId: string
} | null> {
  const token = request.cookies['sessionToken']
  if (!token) return null

  const session = await Session.findOne({ token })

  // Not found or expired
  if (!session || session.expiresAt < new Date()) {
    if (session) await Session.deleteOne({ token }) // clean up expired
    return null
  }

  // IP mismatch — possible stolen cookie
  if (session.ipAddress !== request.ip) {
    request.log.warn(`[Session] ⚠️ IP mismatch for session ${session._id} — expected ${session.ipAddress}, got ${request.ip}`)
    return null
  }

  // Extend session (sliding expiry) — active users stay logged in
  await Session.updateOne(
    { token },
    { expiresAt: new Date(Date.now() + SESSION_TTL) },
  )

  return {
    userId:    session.userId.toString(),
    sessionId: session._id.toString(),
  }
}

// ─── Delete session on logout ─────────────────────────────────────────────────

export async function deleteSession(
  token: string,
  reply: FastifyReply,
): Promise<void> {
  await Session.deleteOne({ token })

  reply.clearCookie('sessionToken', {
    path:     '/',
    httpOnly: true,
    secure:   config.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}