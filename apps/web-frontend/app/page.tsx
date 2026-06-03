"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Mic, Globe, Mail, Download, Monitor, Zap, Star, ArrowRight,
  ChevronRight, Bot, Shield, Eye, Layers, Check, MessageCircle, Code, Briefcase, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import VoiceOrb from "@/components/voice-orb";
import { cn } from "@/lib/utils";

// ── Data ───────────────────────────────────────────────────────────────────────
const COMMANDS = [
  "Search YouTube for lofi beats to study",
  "Write an email to my boss about taking Friday off",
  "Download the PDF from this page",
  "Find me the cheapest flights to Paris next month",
  "Open Gmail and compose a meeting invite",
  "Screenshot this page and save it",
  "Summarize everything on this webpage",
];

const FEATURES = [
  { icon: <Mic size={22} />, title: "Natural Voice Control", description: "Speak naturally and the AI understands your intent — no rigid commands, no learning curve.", color: "violet" },
  { icon: <Globe size={22} />, title: "Full Browser Automation", description: "Navigate pages, fill forms, click buttons, and extract data — all hands-free.", color: "indigo" },
  { icon: <Eye size={22} />, title: "Real-time Visual Preview", description: "Watch the AI work in a live preview panel. Full transparency on every action taken.", color: "indigo" },
  { icon: <Mail size={22} />, title: "Gmail & Calendar", description: "Compose emails, schedule meetings, and manage your inbox with a single sentence.", color: "violet" },
  { icon: <Download size={22} />, title: "Smart File Downloads", description: "Tell BrowserAI what to grab — PDFs, images, spreadsheets — it finds and downloads automatically.", color: "violet" },
  { icon: <Monitor size={22} />, title: "Screen Sharing Mode", description: "Share your screen and let the agent act on what it sees, in any app, any website.", color: "indigo" },
];

const STEPS = [
  { num: "01", title: "Install & Connect", description: "Add BrowserAI to Chrome in under 30 seconds. No configuration. No API keys. Just click and go.", icon: <Zap size={20} /> },
  { num: "02", title: "Speak Your Command", description: 'Press the mic, say what you need — "book a flight", "email the report" — in plain English.', icon: <Mic size={20} /> },
  { num: "03", title: "Watch It Happen", description: "BrowserAI executes every step in real time, narrating what it does. You stay in full control.", icon: <Bot size={20} /> },
];

const STATS = [
  { value: 10, suffix: "x", label: "Faster Than Typing" },
  { value: 96, suffix: "%", label: "Command Success Rate" },
  { value: 2, suffix: "M+", label: "Commands Executed" },
  { value: 0, suffix: "", label: "Typing Required" },
];

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "Product Manager @ Stripe", avatar: "SC", rating: 5, text: "I used to spend hours each week on repetitive browser tasks. BrowserAI cut that down to minutes. I literally just talk to it like a colleague." },
  { name: "Marcus Williams", role: "Founder @ Launchpad", avatar: "MW", rating: 5, text: "The accuracy blows me away. I said 'download all the invoices from last quarter' and it just... did it. All of them. Correctly." },
  { name: "Priya Patel", role: "Data Analyst @ Notion", avatar: "PP", rating: 5, text: "Screen sharing mode is a game changer. I can point BrowserAI at any window and it figures out exactly what to do without any setup." },
];

// ── Animated counter ───────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1800 / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled && "bg-[#0a0a0f]/85 backdrop-blur-xl border-b border-white/6"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-17 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.5)]">
            <Mic size={15} className="text-white" />
          </div>
          <span className="font-bold text-[17px]">BrowserAI</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {["Features", "Pricing", "Docs"].map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`}
              className="px-3.5 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/6 rounded-lg transition-all duration-200">
              {link}
            </a>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="sm" render={<a href="/sign-in" />} className="text-white/70 hover:text-white border border-white/8 hover:bg-white/6">
            Log in
          </Button>
          <Button size="sm" render={<a href="/sign-up" />} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_4px_16px_rgba(124,58,237,0.35)] border-0">
            Start Free
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [commandIndex, setCommandIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCommandIndex((i) => (i + 1) % COMMANDS.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden"
      style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute rounded-full pointer-events-none" style={{ width: 600, height: 600, background: "rgba(124,58,237,0.12)", top: "10%", left: "50%", transform: "translateX(-50%)", filter: "blur(180px)" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 400, height: 400, background: "rgba(79,70,229,0.08)", bottom: "10%", right: "5%", filter: "blur(180px)" }} />

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-7">
          <Badge variant="outline" className="px-4 py-1.5 text-violet-300 bg-violet-950/50 border-violet-500/25 gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
            Now powered by GPT-4o Vision
            <ChevronRight size={12} className="opacity-50" />
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[clamp(40px,7vw,76px)] font-extrabold text-center leading-[1.08] tracking-[-0.03em] mb-6 max-w-4xl"
        >
          Control Your Browser
          <br />
          With Your{" "}
          <span className="bg-gradient-to-r from-violet-300 via-violet-500 to-indigo-500 bg-clip-text text-transparent">Voice</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="text-[clamp(16px,2.5vw,20px)] text-white/50 text-center max-w-[540px] leading-relaxed mb-14"
        >
          The AI browser agent that listens, understands, and acts. Search, email, download — all by speaking naturally.
        </motion.p>

        {/* Voice Orb */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.4, type: "spring", stiffness: 200 }} className="mb-10">
          <VoiceOrb size="lg" state="idle" />
        </motion.div>

        {/* Rotating command pill */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-12 h-11 flex items-center justify-center">
          <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/4 border border-white/8 rounded-full">
            <Mic size={14} className="text-violet-500 shrink-0" />
            <div className="h-[22px] overflow-hidden min-w-[280px] text-center">
              <AnimatePresence mode="wait">
                <motion.p key={commandIndex} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="text-sm text-white/70 italic">
                  &ldquo;{COMMANDS[commandIndex]}&rdquo;
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex gap-3 flex-wrap justify-center">
          <Button size="lg" render={<a href="/sign-up" />} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_4px_24px_rgba(124,58,237,0.4)] border-0 text-[15px] font-semibold px-7">
            <Mic size={16} />Start for Free
          </Button>
          <Button size="lg" variant="outline" render={<a href="#features" />} className="gap-2 border-white/10 bg-white/4 hover:bg-white/8 text-white/80 hover:text-white text-[15px] px-7">
            <Play size={14} />Watch Demo
          </Button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-8 text-xs text-white/25">
          Free forever plan · No credit card required · Chrome extension
        </motion.p>
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 border border-white/6 rounded-2xl overflow-hidden bg-white/[0.01]">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={cn("py-8 px-6 text-center", i < 3 && "border-r border-white/5")}>
              <div className="text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-0.03em] mb-1.5 bg-gradient-to-r from-violet-300 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-white/40 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-6 py-20 relative">
        <div className="absolute rounded-full pointer-events-none" style={{ width: 500, height: 500, background: "rgba(79,70,229,0.07)", top: "10%", right: "-10%", filter: "blur(180px)" }} />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3.5 py-1 text-violet-300 bg-violet-950/40 border-violet-500/20 gap-1.5 uppercase text-[11px] tracking-[0.06em]">
              <Layers size={11} /> Capabilities
            </Badge>
            <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold tracking-[-0.03em] mb-3 leading-tight">
              Everything your browser can do,
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">now voice-controlled</span>
            </h2>
            <p className="text-[17px] text-white/40 max-w-md mx-auto">BrowserAI understands complex, multi-step commands and executes them flawlessly.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="h-full bg-white/[0.03] border-white/6 hover:bg-violet-950/20 hover:border-violet-500/20 hover:-translate-y-1 transition-all duration-300 group">
                  <CardContent className="p-7">
                    <div className="w-12 h-12 rounded-xl bg-violet-950/60 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:border-violet-400/30 transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-[17px] font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-0.03em] mb-3">
              Up and running in{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">60 seconds</span>
            </h2>
            <p className="text-base text-white/40">Three steps. That&apos;s it. No setup, no API keys, no config files.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line */}
            <div className="absolute top-10 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent hidden md:block" />

            {STEPS.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="text-center bg-white/[0.02] border-white/6">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-950/80 to-indigo-950/80 border border-violet-500/25 flex items-center justify-center mx-auto mb-5">
                      <span className="text-2xl font-extrabold text-violet-500 tracking-tight">{step.num}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2.5">{step.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-20 relative">
        <div className="absolute rounded-full pointer-events-none" style={{ width: 400, height: 400, background: "rgba(124,58,237,0.07)", bottom: 0, left: "10%", filter: "blur(180px)" }} />
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-[clamp(28px,5vw,44px)] font-extrabold tracking-[-0.03em] mb-3">Loved by productivity nerds</h2>
            <p className="text-base text-white/40">Join thousands of people who&apos;ve reclaimed their time.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full bg-white/[0.04] border-white/8 backdrop-blur-sm">
                  <CardContent className="p-7">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} size={14} fill="#fbbf24" className="text-amber-400" />
                      ))}
                    </div>
                    <p className="text-[15px] text-white/75 leading-[1.7] mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[13px] font-bold shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-white/40">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 pb-28">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative p-16 rounded-3xl border border-violet-500/20 bg-violet-950/10 text-center overflow-hidden">
            <div className="absolute inset-0 rounded-full pointer-events-none m-auto w-96 h-96" style={{ background: "rgba(124,58,237,0.12)", filter: "blur(80px)" }} />
            <div className="relative z-10">
              <Badge variant="outline" className="mb-6 px-3.5 py-1 text-violet-300 bg-violet-950/50 border-violet-500/25 gap-1.5">
                <Shield size={11} /> Free forever · No credit card
              </Badge>
              <h2 className="text-[clamp(28px,5vw,48px)] font-extrabold tracking-[-0.03em] mb-3 leading-tight">Ready to stop typing?</h2>
              <p className="text-lg text-white/50 mb-9 max-w-sm mx-auto leading-snug">
                Join 50,000+ users who&apos;ve made their browser work for them.
              </p>
              <Button size="lg" render={<a href="/sign-up" />} className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_8px_32px_rgba(124,58,237,0.4)] border-0 text-base font-bold px-8">
                Get Started Free <ArrowRight size={16} />
              </Button>
              <div className="flex items-center justify-center gap-5 mt-7 flex-wrap">
                {["2-minute setup", "Works on any website", "Cancel anytime"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-white/35">
                    <Check size={11} className="text-violet-500" />{item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/6 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Mic size={15} className="text-white" />
                </div>
                <span className="font-bold text-[17px]">BrowserAI</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed max-w-[220px]">
                The AI-powered voice assistant for your browser. Automate anything. Say everything.
              </p>
              <div className="flex gap-2.5 mt-5">
                {[MessageCircle, Code, Briefcase].map((Icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 cursor-pointer transition-all">
                    <Icon size={14} />
                  </div>
                ))}
              </div>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Developers", links: ["Documentation", "API Reference", "Chrome Extension", "GitHub"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Privacy"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-[0.07em] mb-4">{col.title}</p>
                {col.links.map((link) => (
                  <a key={link} href="#" className="block text-sm text-white/35 hover:text-white/80 mb-2.5 transition-colors">{link}</a>
                ))}
              </div>
            ))}
          </div>

          <Separator className="bg-white/6 mb-6" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-white/20">© 2025 BrowserAI Inc. All rights reserved.</p>
            <div className="flex gap-5">
              {["Privacy Policy", "Terms of Service", "Cookies"].map((link) => (
                <a key={link} href="#" className="text-xs text-white/20 hover:text-white/50 transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
