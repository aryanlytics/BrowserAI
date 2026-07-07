"use client";

import { useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import api from "@/lib/api";

type ConnectionStatus = "idle" | "connecting" | "connected";

export default function Dashboard() {
  const roomRef = useRef<Room | null>(null);
  const roomNameRef = useRef<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");

  const connect = async () => {
    if (status !== "idle") return;

    setStatus("connecting");

    try {
      // 1. Create session — voice service generates room, tells AI agent to join
      const { data } = await api.post("/api/voice/session");

      roomNameRef.current = data.roomName;

      // 2. Create LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      room.on(RoomEvent.Connected, () => {
        console.log("✅ LiveKit Connected");
        setStatus("connected");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("❌ LiveKit Disconnected");
        setStatus("idle");
        roomRef.current = null;
        roomNameRef.current = null;
      });

      room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        console.log(`🎧 Subscribed to ${participant.identity} track: ${track.kind}`);
      });

      // 3. Connect browser to LiveKit room
      await room.connect(data.serverUrl, data.token);

      // 4. Enable mic — publishes audio to the room
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
    } catch (err) {
      console.error("LiveKit connection failure:", err);
      setStatus("idle");
    }
  };

  const disconnect = async () => {
    const room = roomRef.current;
    const roomName = roomNameRef.current;

    try {
      // 1. Turn off mic
      if (room) {
        await room.localParticipant.setMicrophoneEnabled(false);
        room.disconnect();
      }

      // 2. Tell voice service to disconnect the AI agent
      if (roomName) {
        await api.post("/api/voice/disconnect", { roomName });
      }
    } catch (err) {
      console.error("Error during disconnect:", err);
    } finally {
      roomRef.current = null;
      roomNameRef.current = null;
      setStatus("idle");
    }
  };

  const handleClick = () => {
    if (status === "connected") {
      disconnect();
    } else if (status === "idle") {
      connect();
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <button
        onClick={handleClick}
        disabled={status === "connecting"}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
      >
        {status === "connecting" && "Connecting..."}
        {status === "connected" && "Disconnect"}
        {status === "idle" && "Start Voice"}
      </button>
    </div>
  );
}
