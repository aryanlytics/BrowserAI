"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Download, Mic, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type PermissionType = "microphone" | "screen-share" | "file-access" | "camera" | "location";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
  permissionType?: PermissionType;
  context?: string;
}

const permissionConfig: Record<
  PermissionType,
  { icon: React.ReactNode; title: string; description: string; risk: "low" | "medium" | "high" }
> = {
  microphone: {
    icon: <Mic size={28} />,
    title: "Microphone Access",
    description: "BrowserAI needs access to your microphone to listen for voice commands. Audio is processed locally and never stored.",
    risk: "low",
  },
  "screen-share": {
    icon: <Eye size={28} />,
    title: "Screen Sharing",
    description: "The AI agent wants to view your screen to complete this task. This allows it to see your display and interact intelligently.",
    risk: "medium",
  },
  "file-access": {
    icon: <Download size={28} />,
    title: "File System Access",
    description: "BrowserAI needs permission to save files to your Downloads folder to complete the requested download.",
    risk: "low",
  },
  camera: {
    icon: <Eye size={28} />,
    title: "Camera Access",
    description: "The agent needs camera access to complete this task. You can revoke this permission at any time.",
    risk: "medium",
  },
  location: {
    icon: <Globe size={28} />,
    title: "Location Access",
    description: "The agent is requesting your approximate location to provide relevant local search results.",
    risk: "high",
  },
};

const riskConfig: Record<"low" | "medium" | "high", { label: string; badge: string; dot: string }> = {
  low:    { label: "Low Risk",           badge: "bg-green-950/50 text-green-300 border-green-500/20", dot: "bg-green-400" },
  medium: { label: "Requires attention", badge: "bg-amber-950/50 text-amber-300 border-amber-500/20", dot: "bg-amber-400" },
  high:   { label: "High Risk",          badge: "bg-red-950/50 text-red-300 border-red-500/20",       dot: "bg-red-400" },
};

export default function PermissionModal({
  isOpen,
  onClose,
  onAllow,
  onDeny,
  permissionType = "microphone",
  context,
}: PermissionModalProps) {
  const config = permissionConfig[permissionType];
  const risk = riskConfig[config.risk];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-[420px] bg-[#0f0a1e]/95 border border-white/10 rounded-2xl p-0 overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(124,58,237,0.1)] gap-0"
        style={{ backdropFilter: "blur(24px)" }}
      >
        {/* Top glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "rgba(124,58,237,0.15)", filter: "blur(60px)" }} />

        <div className="relative px-7 pb-7 pt-7">
          {/* Icon */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
              className="w-18 h-18 rounded-2xl bg-gradient-to-br from-violet-950/80 to-indigo-950/80 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2 shadow-[0_0_32px_rgba(124,58,237,0.2)]"
              style={{ width: 72, height: 72 }}
            >
              {config.icon}
            </motion.div>
            <ShieldCheck size={14} className="text-violet-500/50" />
          </div>

          {/* Title / Description */}
          <DialogHeader className="text-center mb-4 space-y-0">
            <DialogTitle className="text-xl font-bold text-white text-center">{config.title}</DialogTitle>
            <DialogDescription className="text-sm text-white/45 leading-relaxed text-center mt-2">
              {config.description}
            </DialogDescription>
          </DialogHeader>

          {/* Context */}
          {context && (
            <div className="mb-4 px-3.5 py-2.5 bg-white/[0.03] border border-white/6 rounded-xl">
              <p className="text-[12px] text-white/40">
                <span className="text-violet-300/80 font-semibold">Task context: </span>
                {context}
              </p>
            </div>
          )}

          {/* Risk badge */}
          <div className="flex justify-center mb-6">
            <Badge variant="outline" className={cn("gap-1.5 px-3 py-1", risk.badge)}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", risk.dot)} />
              {risk.label}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={onDeny} className="flex-1 border-white/8 bg-white/4 text-white/55 hover:text-white hover:bg-white/8 h-11">
              Deny
            </Button>
            <Button onClick={onAllow}
              className="flex-[2] h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-0 font-semibold shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
              Allow Access
            </Button>
          </div>

          <p className="text-center text-[11px] text-white/20 mt-4">
            You can revoke permissions anytime in Settings → Privacy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
