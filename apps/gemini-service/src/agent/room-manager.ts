// apps/gemini-service/src/agent/room-manager.ts
//
// Manages AI agent sessions inside LiveKit rooms.
// Uses @livekit/rtc-node to get raw audio frames from the user,
// then pipes them to Gemini Live API via websocket-gemini.ts.

import { Room, RoomEvent, AudioStream } from '@livekit/rtc-node'
import type { RemoteTrack, RemoteTrackPublication, RemoteParticipant } from '@livekit/rtc-node'
import { TrackKind } from '@livekit/rtc-node'
import { GeminiLiveConnection } from './websocket-gemini.js'
import config from '../config/config.js'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AgentSession {
  room: Room
  roomName: string
  agentId: string
  gemini: GeminiLiveConnection
  disconnect: () => void
}

// Map of active sessions by room name
const activeSessions = new Map<string, AgentSession>()

// Stores a cancel function for the currently active audio stream per room.
// When a new track arrives (e.g. user switches from built-in mic → Bluetooth),
// we call the old cancel function to stop the previous reader loop,
// then start a new AudioStream for the new track.
const activeAudioStreams = new Map<string, () => void>()

export function getSession(roomName: string): AgentSession | undefined {
  return activeSessions.get(roomName)
}

// ─── Join Room ──────────────────────────────────────────────────────────────

export async function joinRoom(
  roomName: string,
  agentToken: string,
  livekitUrl: string,
): Promise<AgentSession> {
  // Don't join the same room twice
  if (activeSessions.has(roomName)) {
    return activeSessions.get(roomName)!
  }

  let completedText = "";

  // 1. Connect to Gemini Live API first
  const gemini = new GeminiLiveConnection({
    onText: (text) => {
      completedText += text;
      console.log(`[Gemini → ${roomName}] ${completedText}`)
    },
    onError: (err) => {
      console.error(`[Gemini] Error in room ${roomName}:`, err.message)
    },
    onClose: () => {
      console.log(`[Gemini] Connection closed for room ${roomName}`)
    },
  })

  await gemini.connect(config.GEMINI_API_KEY!)
  console.log(`[Agent] Gemini Live connected for room: ${roomName}`)

  // 2. Connect to LiveKit room
  const room = new Room()

  room.on(
    RoomEvent.TrackSubscribed,
    (track: RemoteTrack, _publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind !== TrackKind.KIND_AUDIO) return

      // If there's already an audio stream running, cancel it first.
      // This handles: user switches mic (built-in → Bluetooth),
      // LiveKit fires TrackSubscribed with the NEW track.
      const existingCancel = activeAudioStreams.get(roomName)
      if (existingCancel) {
        console.log(`[Agent] 🔄 New audio track from ${participant.identity}, replacing old stream`)
        existingCancel()
      } else {
        console.log(`[Agent] 🎧 Subscribed to audio from ${participant.identity}`)
      }

      // Create an AudioStream to get raw PCM frames (16kHz mono)
      const audioStream = new AudioStream(track, 16000, 1)

      // Stream audio frames to Gemini
      void streamAudioToGemini(audioStream, gemini, roomName)
    },
  )

  room.on(RoomEvent.Disconnected, () => {
    console.log(`[Agent] Room ${roomName} disconnected`)
    activeAudioStreams.delete(roomName)
    gemini.close()
    activeSessions.delete(roomName)
  })

  await room.connect(livekitUrl, agentToken, {
    autoSubscribe: true,
    dynacast: true,
  })
  console.log(`[Agent] ✅ Joined room: ${roomName}`)

  const agentId = `agent-${roomName}-${Date.now()}`

  const session: AgentSession = {
    room,
    roomName,
    agentId,
    gemini,
    disconnect: () => {
      const cancel = activeAudioStreams.get(roomName)
      if (cancel) cancel()
      gemini.close()
      void room.disconnect()
      activeSessions.delete(roomName)
      console.log(`[Agent] 🛑 Left room: ${roomName}`)
    },
  }

  activeSessions.set(roomName, session)
  return session
}

// ─── Leave Room ─────────────────────────────────────────────────────────────

export function leaveRoom(roomName: string): boolean {
  const session = activeSessions.get(roomName)
  if (!session) return false

  session.disconnect()
  return true
}

// ─── Stream Audio → Gemini ──────────────────────────────────────────────────
// Reads raw Int16 PCM frames from LiveKit AudioStream (ReadableStream<AudioFrame>)
// and sends them to Gemini as base64.
//
// AudioFrame has:
//   .data          → Int16Array (raw PCM samples)
//   .sampleRate    → number (we requested 16000)
//   .channels      → number (we requested 1)

async function streamAudioToGemini(
  audioStream: AudioStream,
  gemini: GeminiLiveConnection,
  roomName: string,
): Promise<void> {
  console.log(`[Agent] 🎤 Streaming audio from room ${roomName} → Gemini`)

  const reader = audioStream.getReader()

  // cancelled is flipped to true when a new track replaces this one.
  // The reader.read() loop checks it each iteration to exit cleanly.
  let cancelled = false

  // Register the cancel function so TrackSubscribed can stop this stream.
  activeAudioStreams.set(roomName, () => {
    cancelled = true
    reader.cancel()
  })

  try {
    while (!cancelled) {
      const { done, value: frame } = await reader.read()
      if (done || !gemini.isReady) break

      // frame.data is Int16Array — convert to Buffer for base64 encoding
      const pcmBuffer = Buffer.from(
        frame.data.buffer,
        frame.data.byteOffset,
        frame.data.byteLength,
      )

      gemini.sendAudio(pcmBuffer)
    }
  } catch (err) {
    // reader.cancel() throws — this is expected when replacing tracks
    if (!cancelled) {
      console.error(`[Agent] Audio stream error in room ${roomName}:`, err)
    }
  } finally {
    reader.releaseLock()

    // Only delete from map if WE are still the active stream.
    // If a new track already replaced us, it stored its own cancel function.
    if (!cancelled) {
      activeAudioStreams.delete(roomName)
    }
  }

  console.log(`[Agent] 🔇 Audio stream ended for room ${roomName}`)
}
