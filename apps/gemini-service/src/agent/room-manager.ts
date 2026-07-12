// apps/gemini-service/src/agent/room-manager
//
// Manages a single AI agent session inside a LiveKit room.
// - Connects to the room with the provided token
// - Subscribes to the user's audio track
// - (Future: pipes audio to Gemini Live API and publishes responses)

import { Room, RoomEvent, RemoteTrackPublication, RemoteParticipant, Track } from 'livekit-client'

export interface AgentSession {
  room: Room
  roomName: string
  agentId: string
  disconnect: () => void
}

// Map of active sessions by room name
const activeSessions = new Map<string, AgentSession>()

export function getSession(roomName: string): AgentSession | undefined {
  return activeSessions.get(roomName)
}

export async function joinRoom(
  roomName: string,
  agentToken: string,
  livekitUrl: string,
): Promise<AgentSession> {
  // Don't join the same room twice
  if (activeSessions.has(roomName)) {
    const existing = activeSessions.get(roomName)!
    return existing
  }

  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  })

  // ── Listen for user's audio track ──────────────────────────────────
  room.on(
    RoomEvent.TrackSubscribed,
    (track, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log(`[Agent] 🎧 Subscribed to audio from ${participant.identity}`)
        // TODO: Pipe this audio to Gemini Live API
      }
    },
  )

  room.on(RoomEvent.Disconnected, () => {
    console.log(`[Agent] Room ${roomName} disconnected`)
    activeSessions.delete(roomName)
  })

  room.on(
    RoomEvent.TrackUnsubscribed,
    (track, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log(`[Agent] 🔇 Unsubscribed from ${participant.identity}`)
      }
    },
  )

  // ── Connect to LiveKit ─────────────────────────────────────────────
  await room.connect(livekitUrl, agentToken)
  console.log(`[Agent] ✅ Joined room: ${roomName}`)

  const agentId = `agent-${roomName}-${Date.now()}`

  const session: AgentSession = {
    room,
    roomName,
    agentId,
    disconnect: () => {
      room.disconnect()
      activeSessions.delete(roomName)
      console.log(`[Agent] 🛑 Left room: ${roomName}`)
    },
  }

  activeSessions.set(roomName, session)
  return session
}

export function leaveRoom(roomName: string): boolean {
  const session = activeSessions.get(roomName)
  if (!session) return false

  session.disconnect()
  return true
}
