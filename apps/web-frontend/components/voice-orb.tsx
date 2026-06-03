"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type OrbSize = "sm" | "md" | "lg";
type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceOrbProps {
  size?: OrbSize;
  state?: OrbState;
  onClick?: () => void;
  className?: string;
}

const sizeMap: Record<OrbSize, { outer: number; inner: number; container: number }> = {
  sm: { outer: 80, inner: 56, container: 100 },
  md: { outer: 120, inner: 88, container: 160 },
  lg: { outer: 160, inner: 120, container: 220 },
};

const stateColors: Record<OrbState, { primary: string; secondary: string; glow: string }> = {
  idle: { primary: "#7c3aed", secondary: "#4f46e5", glow: "rgba(124,58,237,0.3)" },
  listening: { primary: "#8b5cf6", secondary: "#7c3aed", glow: "rgba(139,92,246,0.5)" },
  thinking: { primary: "#6366f1", secondary: "#4f46e5", glow: "rgba(99,102,241,0.4)" },
  speaking: { primary: "#a78bfa", secondary: "#7c3aed", glow: "rgba(167,139,250,0.4)" },
};

function WaveBar({ delay, active }: { delay: number; active: boolean }) {
  return (
    <motion.div
      className="w-[3px] rounded-sm bg-white/80"
      animate={active ? { scaleY: [0.4, 1.4, 0.4], height: [8, 20, 8] } : { scaleY: 1, height: 8 }}
      transition={{ duration: 0.6, delay, repeat: Infinity, ease: "easeInOut" }}
      style={{ originY: 0.5 }}
    />
  );
}

export default function VoiceOrb({ size = "md", state = "idle", onClick, className }: VoiceOrbProps) {
  const { outer, inner, container } = sizeMap[size];
  const { primary, secondary, glow } = stateColors[state];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = outer;
    canvas.height = outer;

    const animate = (t: number) => {
      ctx.clearRect(0, 0, outer, outer);
      const cx = outer / 2;
      const cy = outer / 2;
      const r = inner / 2;

      // Radial gradient fill
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, state === "thinking" ? "#8b5cf6" : primary);
      grad.addColorStop(0.5, secondary);
      grad.addColorStop(1, state === "thinking" ? "#4f46e5" : "#1e0a3c");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner highlight
      const innerGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
      innerGrad.addColorStop(0, "rgba(255,255,255,0.2)");
      innerGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Thinking: rotating arcs
      if (state === "thinking") {
        const angle = (t / 1000) * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r - 4, angle, angle + Math.PI * 1.4);
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r - 10, -angle, -angle + Math.PI * 0.8);
        ctx.strokeStyle = "rgba(167,139,250,0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, primary, secondary, inner, outer]);

  return (
    <div
      className={cn("relative flex items-center justify-center", onClick && "cursor-pointer", className)}
      style={{ width: container, height: container }}
      onClick={onClick}
    >
      {/* Ambient glow blob */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{ width: outer, height: outer, background: glow, filter: `blur(${outer * 0.4}px)` }}
        animate={{ opacity: state === "idle" ? [0.4, 0.7, 0.4] : [0.6, 1, 0.6], scale: state === "idle" ? [1, 1.1, 1] : [1, 1.15, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Listening expand rings */}
      <AnimatePresence>
        {state === "listening" &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{ width: outer, height: outer, border: `1px solid ${primary}` }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 2, delay: i * 0.5, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
      </AnimatePresence>

      {/* Main orb */}
      <motion.div
        className="relative rounded-full overflow-hidden"
        style={{
          width: outer,
          height: outer,
          boxShadow: `0 0 40px ${glow}, 0 0 80px ${glow.replace("0.3", "0.08")}`,
        }}
        animate={state === "idle" ? { scale: [1, 1.03, 1] } : state === "listening" ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        whileHover={onClick ? { scale: 1.05 } : {}}
        whileTap={onClick ? { scale: 0.97 } : {}}
      >
        <canvas ref={canvasRef} style={{ width: outer, height: outer }} />

        {/* Speaking wave bars */}
        <AnimatePresence>
          {state === "speaking" && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[0, 0.1, 0.2, 0.1, 0, 0.15, 0.05].map((delay, i) => (
                <WaveBar key={i} delay={delay} active={state === "speaking"} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
