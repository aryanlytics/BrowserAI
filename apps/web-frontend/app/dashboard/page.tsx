"use client"


import React, { useState, useRef, useEffect } from 'react'

const Dashboard = () => {
  const [transcript, setTranscript] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the latest transcript line
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [transcript])


  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center pt-20 px-4">
      {/* ── Header ──────────────────────────────────────────────── */}
      <h1 className="text-2xl font-semibold mb-8 tracking-tight">Dashboard</h1>

      {/* ── Mic Button ──────────────────────────────────────────── */}
      

      {/* ── Transcript Panel ────────────────────────────────────── */}
      <div className="w-full max-w-2xl mt-10">
        <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
          Live Transcript
        </h2>

        <div
          ref={scrollRef}
          className="h-72 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-y-auto p-5 space-y-3"
        >
          {transcript.length === 0 ? (
            <p className="text-white/30 text-sm italic">
              Tap the mic and start speaking — your transcript will appear here.
            </p>
          ) : (
            transcript.map((line, i) => (
              <p
                key={i}
                className="text-sm text-white/80 leading-relaxed border-l-2 border-violet-500/40 pl-3"
              >
                {line}
              </p>
            ))
          )}
        </div>

        {transcript.length > 0 && (
          <button
            onClick={() => setTranscript([])}
            className="mt-3 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Clear transcript
          </button>
        )}
      </div>
    </div>
  )
}

export default Dashboard