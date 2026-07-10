// apps/voice-service/src/grpc/agent-client.ts
//
// gRPC client that Voice Service (4002) uses to tell
// Gemini Service (4003) to join or leave a LiveKit room.

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'

// ─── Load proto ──────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = path.resolve(__dirname, '../../../proto/agent.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const proto = grpc.loadPackageDefinition(packageDefinition) as any

// ─── Client Singleton ────────────────────────────────────────────────────────

let client: any = null

export function getAgentClient(grpcUrl: string) {
  if (!client) {
    client = new proto.agent.AgentService(
      grpcUrl,
      grpc.credentials.createInsecure(),
    )
    console.log(`[gRPC Client] Connected to Gemini Service at ${grpcUrl}`)
  }
  return client
}

// ─── JoinRoom ────────────────────────────────────────────────────────────────

interface JoinRoomRequest {
  roomName: string
  agentToken: string
  livekitUrl: string
}

interface JoinRoomResponse {
  success: boolean
  agentId: string
  error: string
}

export function joinRoom(
  grpcUrl: string,
  request: JoinRoomRequest,
): Promise<JoinRoomResponse> {
  const c = getAgentClient(grpcUrl)

  return new Promise((resolve, reject) => {
    c.joinRoom(request, (err: grpc.ServiceError | null, response: JoinRoomResponse) => {
      if (err) return reject(err)
      resolve(response)
    })
  })
}

// ─── LeaveRoom ───────────────────────────────────────────────────────────────

interface LeaveRoomRequest {
  roomName: string
}

interface LeaveRoomResponse {
  success: boolean
  error: string
}

export function leaveRoom(
  grpcUrl: string,
  request: LeaveRoomRequest,
): Promise<LeaveRoomResponse> {
  const c = getAgentClient(grpcUrl)

  return new Promise((resolve, reject) => {
    c.leaveRoom(request, (err: grpc.ServiceError | null, response: LeaveRoomResponse) => {
      if (err) return reject(err)
      resolve(response)
    