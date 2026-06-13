import { randomBytes } from 'crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { Session } from '../schema/mongo/session.model.js'
import { config } from '../config/config.js'

const DAY_MS            = 24 * 60 * 60 * 1000
const SESSION_TTL       = 7 * DAY_MS
const REFRESH_THRESHOLD = 2 * DAY_MS        // refresh when ≤ 2 days remain
const COOKIE_MAX_AGE    = 7 * 24 * 60 * 60  // seconds

// ─── Cookie options ───────────────────────────────────────────────────────────
// Defined once — reused in createSession, validateSession, deleteSession

const cookieOptions = {
  path:     '/',
  httpOnly: true,
  secure:   config.NODE_ENV === 'production',
  sameSite: 'lax' as const,
}

// ─── Create session ───────────────────────────────────────────────────────────

export async function createSession(
  userId: string,
  ip: string,
  userAgent: string,
  reply: FastifyReply,
): Promise<void> {
  const token     = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL)

  await Session.create({
    userId,
    token,
    ipAddress: ip        || 'unknown',
    userAgent: userAgent || 'unknown',
    expiresAt,
  })

  reply.setCookie('sessionToken', token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE,
  })
}

// ─── Validate session ─────────────────────────────────────────────────────────

export async function validateSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<{ userId: string; sessionId: string } | null> {
  const token = request.cookies['sessionToken']
  if (!token) return null

  const session = await Session.findOne({ token })

  // Not found
  if (!session) return null

  // Expired — clean up both DB and cookie
  if (session.expiresAt.getTime() < Date.now()) {
    await Session.deleteOne({ _id: session._id })
    reply.clearCookie('sessionToken', cookieOptions)
    return null
  }

  const currentIp = request.ip
  const currentUa = request.headers['user-agent'] || 'unknown'
  const ipMatch   = session.ipAddress === currentIp
  const uaMatch   = session.userAgent === currentUa

  // Both changed → likely stolen cookie → invalidate and force re-login
  if (!ipMatch && !uaMatch) {
    request.log.warn(`[Session] ⚠️  IP + UA both changed — invalidating session ${session._id}`)
    await Session.deleteOne({ _id: session._id })
    reply.clearCookie('sessionToken', cookieOptions)
    return null
  }

  if (!ipMatch) request.log.info(`[Session] IP changed (${session.ipAddress} → ${currentIp}) — UA matches`)
  if (!uaMatch) request.log.info(`[Session] UA changed — IP matches`)

  // Refresh only when ≤ 2 days remain (sliding expiry — not on every request)
  const remaining = session.expiresAt.getTime() - Date.now()
  if (remaining <= REFRESH_THRESHOLD) {
    const newExpiresAt = new Date(Date.now() + SESSION_TTL)
    await Session.updateOne({ _id: session._id }, { expiresAt: newExpiresAt })
    reply.setCookie('sessionToken', token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE })
    request.log.info(`[Session] Refreshed session ${session._id}`)
  }

  return {
    userId:    session.userId.toString(),
    sessionId: session._id.toString(),
  }
}

// ─── Delete session ───────────────────────────────────────────────────────────

export async function deleteSession(
  token: string,
  reply: FastifyReply,
): Promise<void> {
  await Session.deleteOne({ token })
  reply.clearCookie('sessionToken', cookieOptions)
}