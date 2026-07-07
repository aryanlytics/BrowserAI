// apps/gemini-service/src/grpc/agent-server.ts
//
// gRPC server that Voice Service (4002) calls to tell the AI agent
// to join or leave a LiveKit room.

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { fileURLToPath } from 'url'
import { joinRoom, leaveRoom } from '../agent/livekit-agent.js'

// ─── Load proto ──────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROTO_PATH = path.resolve(__dirname, '../../../proto/agent.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,      // convert snake_case → camelCase
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
})

const proto = grpc.loadPackageDefinition(packageDefinition) as any

// ─── RPC Handlers ────────────────────────────────────────────────────────────

async function handleJoinRoom(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>,
) {
  const { roomName, agentToken, livekitUrl } = call.request

  console.log(`[gRPC] JoinRoom request for room: ${roomName}`)

  try {
    const session = await joinRoom(roomName, agentToken, livekitUrl)

    callback(null, {
      success: true,
      agentId: session.agentId,
      error: '',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[gRPC] JoinRoom failed:`, message)

    callback(null, {
      success: false,
      agentId: '',
      error: message,
    })
  }
}

async function handleLeaveRoom(
  call: grpc.ServerUnaryCall<any, any>,
  callback: grpc.sendUnaryData<any>,
) {
  const { roomName } = call.request

  console.log(`[gRPC] LeaveRoom request for room: ${roomName}`)

  const left = leaveRoom(roomName)

  callback(null, {
    success: left,
    error: left ? '' : `No active session for room: ${roomName}`,
  })
}

// ─── Start Server ────────────────────────────────────────────────────────────

export function startGrpcServer(port: number): grpc.Server {
  const server = new grpc.Server()

  server.addService(proto.agent.AgentService.service, {
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
  })

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error(`[gRPC] ❌ Failed to bind: ${err.message}`)
        process.exit(1)
      }
      console.log(`[gRPC] ✅ Agent server listening on port ${boundPort}`)
    },
  )

  return server
}
