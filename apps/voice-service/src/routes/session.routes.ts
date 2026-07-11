// apps/voice-service/src/routes/session.routes.ts
//
// POST /api/voice/session     → Create room, tell AI agent to join, return token to browser
// POST /api/voice/disconnect  → Tell AI agent to leave the room

import type { FastifyPluginAsync } from "fastify"
import { config } from "../config/config.js"
import { AccessToken } from "livekit-server-sdk"
import { joinRoom, leaveRoom } from "../grpc/gemini-rpc-client.js"
import crypto from "crypto"

const voiceRoutes: FastifyPluginAsync = async (fastify) => {

  // ─── Start Session ──────────────────────────────────────────────────────────
  fastify.post("/api/voice/session", async (request, reply) => {
    // 1. Generate unique room name
    const roomName = `session-${crypto.randomUUID()}`

    // 2. Generate browser token (for the user)
    const userToken = new AccessToken(
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_SECRET_KEY,
      {
        identity: `user-${crypto.randomUUID().slice(0, 8)}`,
        name: "Browser User",
      },
    )
    userToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    // 3. Generate agent token (for the Gemini AI agent)
    const agentToken = new AccessToken(
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_SECRET_KEY,
      {
        identity: `gemini-agent-${crypto.randomUUID().slice(0, 8)}`,
        name: "Gemini Agent",
      },
    )
    agentToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const agentJwt = await agentToken.toJwt()

    // 4. Tell Gemini Service to join the room via gRPC
    const grpcResponse = await joinRoom(config.GEMINI_GRPC_URL, {
      roomName,
      agentToken: agentJwt,
      livekitUrl: config.LIVEKIT_URL,
    })

    if (!grpcResponse.success) {
      request.log.error(`[gRPC] Agent failed to join: ${grpcResponse.error}`)
      return reply.status(502).send({
        error: "AI agent failed to join the room",
        detail: grpcResponse.error,
      })
    }

    request.log.info(`[Session] Room ${roomName} created, agent ${grpcResponse.agentId} joined`)

    // 5. Return user token + room info to browser
    return {
      serverUrl: config.LIVEKIT_URL,
      token: await userToken.toJwt(),
      roomName,
    }
  })

  // ─── End Session ────────────────────────────────────────────────────────────
  fastify.post("/api/voice/disconnect", async (request, reply) => {
    const { roomName } = request.body as { roomName: string }

    if (!roomName) {
      return reply.status(400).send({ error: "roomName is required" })
    }

    const grpcResponse = await leaveRoom(config.GEMINI_GRPC_URL, { roomName })

    if (!grpcResponse.success) {
      request.log.warn(`[gRPC] Agent leave failed: ${grpcResponse.error}`)
    }

    return { ok: true }
  })
}

export default voiceRoutes
