import { randomBytes } from 'crypto'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { Session } from '../schema/mongo/session.model.js'
import { type IUser } from '../schema/mongo/user.model.js'
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

// ─── Validated session payload ────────────────────────────────────────────────
// Returned by validateSession. Includes the populated user so callers
// never need a second DB round-trip.

export interface ValidSession {
  user: {
    id:            string
    name:          string
    email:         string
  }
}

export async function validateSession(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<ValidSession | null> {
  const token = request.cookies['sessionToken']
  if (!token) return null

  // Single query — populate joins the User document in the same round-trip.
  const session = await Session
    .findOne({ token })
    .populate<{ userId: IUser | null }>('userId')

  // Not found
  if (!session) return null

  // User was deleted after the session was created
  if (!session.userId) {
    await Session.deleteOne({ _id: session._id })
    reply.clearCookie('sessionToken', cookieOptions)
    return null
  }

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

  const u = session.userId  // already populated — IUser
  return {
    user: {
      id:            u._id.toString(),
      name:          u.name,
      email:         u.email,
    },
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