"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Monitor, MonitorOff, Settings, LogOut, Send,
  Globe, Mail, Search, Download, Clock, ChevronRight, Zap,
  LayoutDashboard, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import VoiceOrb from "@/components/voice-orb";
import AgentFeed, { type AgentStep } from "@/components/agent-feed";
import PermissionModal, { type PermissionType } from "@/components/permission-modal";
import { cn } from "@/lib/utils";

// ── Mock data ──────────────────────────────────────────────────────────────────
const RECENT_TASKS = [
  { id: "1", icon: <Search size={13} />, label: "Searched YouTube for lofi beats", time: "2m ago" },
  { id: "2", icon: <Mail size={13} />, label: "Composed email to team about sprint", time: "14m ago" },
  { id: "3", icon: <Download size={13} />, label: "Downloaded Q3 financial report PDF", time: "1h ago" },
  { id: "4", icon: <Globe size={13} />, label: "Browsed Amazon for ergonomic chairs", time: "3h ago" },
];

const QUICK_COMMANDS = [
  { label: "Open Gmail", icon: <Mail size={13} />, command: "Open Gmail and check my inbox" },
  { label: "Google something", icon: <Search size={13} />, command: "Search Google for latest AI news" },
  { label: "Download file", icon: <Download size={13} />, command: "Download the PDF on this page" },
];

function createDemoSteps(command: string): AgentStep[] {
  const now = new Date();
  return [
    { id: `${now.getTime()}-1`, type: "thinking", content: `Analyzing: "${command.slice(0, 55)}${command.length > 55 ? "..." : ""}"`, detail: "GPT-4o parsing intent", timestamp: now },
    { id: `${now.getTime()}-2`, type: "browsing", content: "Opening target website", detail: "chrome.tabs.create({ url: '...' })", timestamp: new Date(now.getTime() + 800), duration: 340 },
    { id: `${now.getTime()}-3`, type: "searching", content: "Locating relevant elements", detail: "document.querySelectorAll('[data-testid]')", timestamp: new Date(now.getTime() + 1600), duration: 220 },
    { id: `${now.getTime()}-4`, type: "clicking", content: "Interacting with page elements", detail: "Clicking: #search-input", timestamp: new Date(now.getTime() + 2400), duration: 120 },
    { id: `${now.getTime()}-5`, type: "reading", content: "Extracting and reading results", detail: "Parsing DOM for relevant content", timestamp: new Date(now.getTime() + 3200), duration: 480 },
    { id: `${now.getTime()}-6`, type: "complete", content: "Task completed successfully", detail: "All steps finished without errors", timestamp: new Date(now.getTime() + 4000), duration: 4000 },
  ];
}

type OrbState = "idle" | "listening" | "thinking" | "speaking";

const orbLabels: Record<OrbState, string> = {
  idle: "Tap the mic to wake the agent",
  listening: "Listening...",
  thinking: "Processing your command...",
  speaking: "Speaking results...",
};

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [isMicActive, setIsMicActive] = useState(false);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [commandInput, setCommandInput] = useState("");
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [pendingPermission, setPendingPermission] = useState<PermissionType>("microphone");

  const runCommand = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    setAgentSteps([]);
    setOrbState("listening");
    await new Promise((r) => setTimeout(r, 1200));
    setOrbState("thinking");
    const steps = createDemoSteps(text);
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 600 : 800));
      setAgentSteps((prev) => [...prev, steps[i]]);
    }
    setOrbState("speaking");
    await new Promise((r) => setTimeout(r, 2000));
    setOrbState("idle");
    setIsProcessing(false);
  }, [isProcessing]);

  const handleMicToggle = () => {
    if (orbState === "listening") { setOrbState("idle"); setIsMicActive(false); }
    else if (orbState === "idle") { setPendingPermission("microphone"); setShowPermissionModal(true); }
  };

  const handleScreenShare = () => {
    if (isScreenShared) { setIsScreenShared(false); }
    else { setPendingPermission("screen-share"); setShowPermissionModal(true); }
  };

  const handlePermissionAllow = () => {
    setShowPermissionModal(false);
    if (pendingPermission === "microphone") {
      setIsMicActive(true);
      setOrbState("listening");
      setTimeout(() => runCommand("Listen for voice command and execute it"), 3000);
    } else if (pendingPermission === "screen-share") {
      setIsScreenShared(true);
    }
  };

  const handleSendCommand = () => {
    if (!commandInput.trim()) return;
    const cmd = commandInput;
    setCommandInput("");
    runCommand(cmd);
  };

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="h-[60px] border-b border-white/6 flex items-center px-5 gap-3 shrink-0 bg-[#0a0a0f]/90 backdrop-blur-xl z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <Mic size={14} className="text-white" />
          </div>
          <span className="font-bold text-[15px]">BrowserAI</span>
        </div>

        {/* Agent status badge */}
        <Badge variant="outline" className="bg-green-950/30 border-green-500/20 text-green-400 gap-1.5 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-status-pulse" />
          Agent Online
        </Badge>

        <div className="flex-1" />

        {/* Nav */}
        <Button variant="ghost" size="sm" className="gap-1.5 text-violet-400 bg-violet-950/30 hover:bg-violet-950/50 border border-violet-500/20 text-[12px]">
          <LayoutDashboard size={13} />Dashboard
        </Button>

        <Button variant="ghost" size="icon" className="w-[34px] h-[34px] text-white/40 hover:text-white border border-white/6 hover:bg-white/6">
          <Settings size={15} />
        </Button>

        <Avatar className="w-8 h-8 rounded-lg cursor-pointer">
          <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[12px] font-bold">JD</AvatarFallback>
        </Avatar>

        <Button variant="ghost" size="sm" className="gap-1.5 text-red-400/70 hover:text-red-400 bg-red-950/10 hover:bg-red-950/20 border border-red-500/12 text-[12px]">
          <LogOut size={12} />Logout
        </Button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside className="w-[272px] border-r border-white/6 flex flex-col shrink-0 bg-white/[0.005]">
          <ScrollArea className="flex-1">
            {/* Browser Access */}
            <div className="p-4 border-b border-white/5">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.08em] mb-3.5">Browser Access</p>

              {/* Screen share toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/6 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200",
                    isScreenShared
                      ? "bg-violet-950/60 border-violet-500/30 text-violet-400"
                      : "bg-white/4 border-white/8 text-white/35"
                  )}>
                    {isScreenShared ? <Monitor size={13} /> : <MonitorOff size={13} />}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-white/80">Share Screen</p>
                    <p className="text-[10px] text-white/30">{isScreenShared ? "Active" : "Inactive"}</p>
                  </div>
                </div>
                <Toggle
                  pressed={isScreenShared}
                  onPressedChange={handleScreenShare}
                  className={cn(
                    "w-10 h-5 p-0 rounded-full data-[state=on]:bg-violet-600 bg-white/10 border border-white/8 transition-all",
                    "relative"
                  )}
                  aria-label="Toggle screen share"
                >
                  <span className={cn(
                    "absolute w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    isScreenShared ? "translate-x-2.5" : "-translate-x-2.5"
                  )} />
                </Toggle>
              </div>

              {/* Web access */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-950/20 border border-green-500/12">
                <Globe size={13} className="text-green-400" />
                <span className="text-[12px] text-green-400/80 font-medium">Web Access Enabled</span>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="p-4 border-b border-white/5">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.08em] mb-3">Recent Tasks</p>
              {RECENT_TASKS.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-2 px-2.5 py-2 rounded-lg mb-1 cursor-pointer hover:bg-white/[0.03] transition-colors group"
                >
                  <div className="w-6 h-6 rounded-md bg-violet-950/50 border border-violet-500/15 flex items-center justify-center text-violet-500 shrink-0 mt-0.5">
                    {task.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/65 leading-snug mb-1 truncate">{task.label}</p>
                    <div className="flex items-center gap-1">
                      <Clock size={9} className="text-white/20" />
                      <span className="text-[10px] text-white/20">{task.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Commands */}
            <div className="p-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.08em] mb-3">Quick Commands</p>
              {QUICK_COMMANDS.map((cmd, i) => (
                <motion.button
                  key={cmd.label}
                  onClick={() => runCommand(cmd.command)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-violet-950/20 hover:border-violet-500/15 text-white/60 hover:text-white/80 text-[12px] mb-1.5 transition-all cursor-pointer text-left"
                >
                  <span className="text-violet-500 shrink-0">{cmd.icon}</span>
                  <span className="flex-1">{cmd.label}</span>
                  <ChevronRight size={11} className="text-white/20" />
                </motion.button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* ── Main Center ── */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(124,58,237,0.05) 0%, transparent 100%)" }} />

          {/* Orb area */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 relative z-10">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: "spring" }}>
              <VoiceOrb size="lg" state={orbState} onClick={handleMicToggle} />
            </motion.div>

            {/* State label */}
            <AnimatePresence mode="wait">
              <motion.p key={orbState} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className={cn("text-sm text-center", orbState === "idle" ? "text-white/30" : "text-white/70 font-medium")}>
                {orbLabels[orbState]}
              </motion.p>
            </AnimatePresence>

            {/* Mic button */}
            <motion.button
              onClick={handleMicToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
                isMicActive
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_32px_rgba(124,58,237,0.5)] border border-violet-500/50 text-white"
                  : "bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/8"
              )}
            >
              {isMicActive ? <Mic size={24} /> : <MicOff size={24} />}
            </motion.button>

            {/* Screen share shortcut */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleScreenShare}
              className={cn(
                "gap-2 transition-all",
                isScreenShared
                  ? "text-violet-400 bg-violet-950/30 border border-violet-500/25 hover:bg-violet-950/40"
                  : "text-white/35 border border-white/8 hover:text-white/60 hover:bg-white/6"
              )}
            >
              {isScreenShared ? <Monitor size={14} /> : <MonitorOff size={14} />}
              {isScreenShared ? "Stop Sharing" : "Share Screen"}
            </Button>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-center gap-5 px-4 py-3 border-t border-white/4 shrink-0">
            {[
              { label: "Agent online", active: true, icon: <Zap size={11} />, color: "text-green-400" },
              { label: "Web access", active: true, icon: <Globe size={11} />, color: "text-blue-400" },
              { label: "Screen shared", active: isScreenShared, icon: <Monitor size={11} />, color: "text-violet-400" },
            ].map((s) => (
              <div key={s.label} className={cn("flex items-center gap-1.5 text-[11px] transition-all duration-300", s.active ? s.color : "text-white/20")}>
                {s.icon}{s.label}
              </div>
            ))}
          </div>

          {/* Command input */}
          <div className="px-5 py-3 pb-4 border-t border-white/6 shrink-0">
            <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5 focus-within:border-violet-500/40 transition-colors">
              <FileText size={15} className="text-white/20 shrink-0" />
              <input
                type="text"
                placeholder='Type a command... e.g. "Download the file on this page"'
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendCommand(); } }}
                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-white/20 font-sans"
              />
              <Button
                size="icon"
                onClick={handleSendCommand}
                disabled={!commandInput.trim() || isProcessing}
                className={cn(
                  "w-9 h-9 rounded-lg shrink-0 border-0",
                  commandInput.trim()
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                    : "bg-white/6 text-white/20 cursor-not-allowed"
                )}
              >
                <Send size={14} />
              </Button>
            </div>
            <p className="text-center text-[11px] text-white/15 mt-2">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/6 border border-white/10 text-[10px]">↵</kbd> to send
              {" · "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/6 border border-white/10 text-[10px]">Mic</kbd> for voice
            </p>
          </div>
        </main>

        {/* ── Right Sidebar: Agent Feed ── */}
        <aside className="w-[320px] border-l border-white/6 shrink-0 flex flex-col overflow-hidden bg-white/[0.005]">
          <AgentFeed steps={agentSteps} title="Agent Activity" />
        </aside>
      </div>

      <PermissionModal
        isOpen={showPermissionModal}
        permissionType={pendingPermission}
        context={
          pendingPermission === "microphone"
            ? "Activating voice control to listen for commands"
            : "Sharing your screen so the AI agent can navigate your browser"
        }
        onClose={() => setShowPermissionModal(false)}
        onAllow={handlePermissionAllow}
        onDeny={() => setShowPermissionModal(false)}
      />
    </div>
  );
}
