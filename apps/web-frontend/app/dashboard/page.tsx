"use client";

import { useRef, useState, useEffect } from "react";
import { Room, RoomEvent } from "livekit-client";
import api from "@/lib/api";

type ConnectionStatus = "idle" | "connecting" | "connected";

export default function Dashboard() {
  const roomRef = useRef<Room | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");

  const connect = async () => {
    if (status !== "idle") return;

    setStatus("connecting");

    try {
      const { data } = await api.post("/api/voice/temp-token");

      // Configure room performance optimizations
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      // 🚀 CRITICAL FIX: Bind listeners BEFORE invoking room.connect()
      room.on(RoomEvent.Connected, () => {
        console.log("✅ LiveKit Connected");
        setStatus("connected");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("❌ LiveKit Disconnected");
        setStatus("idle");
        roomRef.current = null;
      });

      room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        console.log(`Connection quality for ${participant.identity}:`, quality);
      });

      // Fire network connection pipeline
      await room.connect(data.serverUrl, data.token);

      // Explicitly capture hardware mic stream
      await room.localParticipant.setMicrophoneEnabled(true);
      
      roomRef.current = room;
    } catch (err) {
      console.error("LiveKit connection failure:", err);
      setStatus("idle");
    }
  };

  const disconnect = async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      // Gracefully turn off mic and unpublish tracks before killing socket connection
      await room.localParticipant.setMicrophoneEnabled(false);
      room.disconnect();
    } catch (err) {
      console.error("Error during graceful disconnect:", err);
    } finally {
      roomRef.current = null;
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

  // Automated layout memory unmount hook
  useEffect(() => {
    return () => {
      const activeRoom = roomRef.current;
      if (activeRoom) {
        activeRoom.localParticipant.setMicrophoneEnabled(false).catch(console.error);
        activeRoom.disconnect();
      }
    };
  }, []);

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
