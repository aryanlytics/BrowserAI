"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Search, Download, FileText, MousePointer2,
  Eye, CheckCircle2, AlertCircle, Loader2, Brain, Zap, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type AgentStepType =
  | "thinking" | "browsing" | "searching" | "downloading"
  | "typing" | "clicking" | "reading" | "complete" | "error";

export interface AgentStep {
  id: string;
  type: AgentStepType;
  content: string;
  detail?: string;
  timestamp: Date;
  duration?: number;
}

const stepIcons: Record<AgentStepType, React.ReactNode> = {
  thinking: <Brain size={13} />,
  browsing: <Globe size={13} />,
  searching: <Search size={13} />,
  downloading: <Download size={13} />,
  typing: <FileText size={13} />,
  clicking: <MousePointer2 size={13} />,
  reading: <Eye size={13} />,
  complete: <CheckCircle2 size={13} />,
  error: <AlertCircle size={13} />,
};

const stepStyles: Record<AgentStepType, { badge: string; icon: string }> = {
  thinking:   { badge: "bg-indigo-950/50 text-indigo-300 border-indigo-500/20",   icon: "bg-indigo-950/60 border-indigo-500/25 text-indigo-300" },
  browsing:   { badge: "bg-violet-950/50 text-violet-300 border-violet-500/20",   icon: "bg-violet-950/60 border-violet-500/25 text-violet-300" },
  searching:  { badge: "bg-blue-950/50 text-blue-300 border-blue-500/20",         icon: "bg-blue-950/60 border-blue-500/25 text-blue-300" },
  downloading:{ badge: "bg-emerald-950/50 text-emerald-300 border-emerald-500/20",icon: "bg-emerald-950/60 border-emerald-500/25 text-emerald-300" },
  typing:     { badge: "bg-amber-950/50 text-amber-300 border-amber-500/20",      icon: "bg-amber-950/60 border-amber-500/25 text-amber-300" },
  clicking:   { badge: "bg-pink-950/50 text-pink-300 border-pink-500/20",         icon: "bg-pink-950/60 border-pink-500/25 text-pink-300" },
  reading:    { badge: "bg-cyan-950/50 text-cyan-300 border-cyan-500/20",         icon: "bg-cyan-950/60 border-cyan-500/25 text-cyan-300" },
  complete:   { badge: "bg-green-950/50 text-green-300 border-green-500/20",      icon: "bg-green-950/60 border-green-500/25 text-green-300" },
  error:      { badge: "bg-red-950/50 text-red-300 border-red-500/20",            icon: "bg-red-950/60 border-red-500/25 text-red-300" },
};

const stepLabels: Record<AgentStepType, string> = {
  thinking: "Thinking", browsing: "Browsing", searching: "Searching",
  downloading: "Downloading", typing: "Typing", clicking: "Clicking",
  reading: "Reading", complete: "Complete", error: "Error",
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

interface AgentStepItemProps {
  step: AgentStep;
  index: number;
  isLatest: boolean;
}

function AgentStepItem({ step, index, isLatest }: AgentStepItemProps) {
  const styles = stepStyles[step.type];
  const isActive = isLatest && step.type !== "complete" && step.type !== "error";

  return (
    <motion.div
      initial={{ opacity: 0, x: 16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
      className={cn(
        "flex gap-3 p-3 rounded-xl border transition-colors",
        isLatest
          ? cn("border-opacity-100", styles.badge.split(" ")[0].replace("bg-", "border-").replace("/50", "/20"), styles.badge.split(" ")[0])
          : "bg-white/[0.02] border-white/4"
      )}
    >
      {/* Icon */}
      <div className="shrink-0 pt-0.5">
        <div className={cn("w-7 h-7 rounded-lg border flex items-center justify-center relative", styles.icon)}>
          {stepIcons[step.type]}
          {isActive && (
            <motion.div
              className={cn("absolute inset-[-1px] rounded-lg border", styles.icon.split(" ").find(c => c.startsWith("border-")))}
              animate={{ opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-[0.06em] py-0 px-1.5 h-4", styles.badge)}>
            {stepLabels[step.type]}
          </Badge>
          {isActive && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={cn(styles.icon.split(" ")[2])}>
              <Loader2 size={10} />
            </motion.div>
          )}
          {step.duration && (
            <span className="text-[10px] text-white/25 ml-auto">{step.duration}ms</span>
          )}
        </div>
        <p className="text-[13px] text-white/80 leading-snug mb-1">{step.content}</p>
        {step.detail && (
          <div className="flex items-center gap-1 mt-1">
            <ChevronRight size={9} className="text-white/20 shrink-0" />
            <p className="text-[11px] text-white/35 font-mono truncate">{step.detail}</p>
          </div>
        )}
        <p className="text-[10px] text-white/20 mt-1.5">{formatTime(step.timestamp)}</p>
      </div>
    </motion.div>
  );
}

// ── Agent Feed ─────────────────────────────────────────────────────────────────
interface AgentFeedProps {
  steps: AgentStep[];
  title?: string;
  className?: string;
}

export default function AgentFeed({ steps, title = "Agent Activity", className }: AgentFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [steps]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-950/50 border border-violet-500/20 flex items-center justify-center">
            <Zap size={13} className="text-violet-400" />
          </div>
          <span className="text-[13px] font-semibold text-white/90">{title}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-status-pulse" />
          <span className="text-[11px] text-white/35">Live</span>
        </div>
      </div>

      {/* Steps */}
      <ScrollArea className="flex-1">
        <div className="p-3 flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {steps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 pt-14 pb-8 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-950/30 border border-violet-500/15 flex items-center justify-center">
                  <Brain size={20} className="text-violet-500/70" />
                </div>
                <p className="text-[13px] text-white/25 max-w-[200px] leading-relaxed">
                  Agent activity will appear here once you give a command.
                </p>
              </motion.div>
            ) : (
              steps.map((step, i) => (
                <AgentStepItem key={step.id} step={step} index={i} isLatest={i === steps.length - 1} />
              ))
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Footer */}
      {steps.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/6 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-white/25">{steps.length} step{steps.length !== 1 ? "s" : ""} recorded</span>
          <span className="text-[11px] text-violet-500/60">{steps.filter((s) => s.type === "complete").length} completed</span>
        </div>
      )}
    </div>
  );
}
