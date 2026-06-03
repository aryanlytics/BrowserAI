"use client";
import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Eye, EyeOff, Check, X, Loader2, ArrowRight, CheckCircle2, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Left panel ─────────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div
      className="flex-1 hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden min-h-screen"
      style={{ background: "linear-gradient(135deg, #1a0a3c, #0d0625, #0a0a1a)" }}
    >
      <div className="absolute rounded-full pointer-events-none" style={{ width: 400, height: 400, background: "rgba(124,58,237,0.25)", top: "20%", left: "20%", transform: "translate(-50%,-50%)", filter: "blur(180px)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, background: "rgba(79,70,229,0.15)", bottom: "10%", right: "10%", filter: "blur(180px)" }} />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-2.5">
            Welcome back to<br />
            <span className="bg-gradient-to-r from-violet-300 to-indigo-400 bg-clip-text text-transparent">BrowserAI</span>
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Your AI browser agent has been working hard. Sign in to see what it&apos;s learned.
          </p>
        </motion.div>

        {/* Feature highlights */}
        {[
          { icon: <Mic size={14} />, label: "Voice-first browser control" },
          { icon: <Globe size={14} />, label: "Works on any website" },
          { icon: <Shield size={14} />, label: "Private & encrypted" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <Card className="mb-3 bg-white/[0.03] border-white/6">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-950/60 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm text-white/60">{item.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Stat card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Card className="mt-6 bg-violet-950/30 border-violet-500/15">
            <CardContent className="p-5">
              <p className="text-[28px] font-extrabold text-violet-300 tracking-tight">2M+</p>
              <p className="text-sm text-white/35 mt-1">commands executed this month</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// ── Sign In Page ───────────────────────────────────────────────────────────────
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const touch = (field: keyof typeof touched) => setTouched((t) => ({ ...t, [field]: true }));

  const emailValid = touched.email && validateEmail(email);
  const emailInvalid = touched.email && !validateEmail(email) && email.length > 0;
  const passwordValid = touched.password && password.length >= 8;
  const passwordInvalid = touched.password && password.length > 0 && password.length < 8;
  const canSubmit = validateEmail(email) && password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-white">
      <LeftPanel />

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-9">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Mic size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">BrowserAI</span>
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Sign in to your account</h1>
          <p className="text-sm text-white/40 mb-7">Good to have you back. Let&apos;s get to work.</p>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full mb-5 border-white/10 bg-white/5 hover:bg-white/8 text-white hover:text-white gap-2.5 h-11"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.705A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.963L3.964 7.295C4.672 5.169 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/7" />
            <span className="text-xs text-white/30">or sign in with email</span>
            <div className="flex-1 h-px bg-white/7" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-[13px]">Email Address</Label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => touch("email")}
                  className={cn(
                    "bg-white/4 border-white/8 text-white placeholder:text-white/25 h-11 pr-10 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60",
                    emailValid && "border-green-500/50 bg-green-950/10",
                    emailInvalid && "border-red-500/50 bg-red-950/10"
                  )}
                />
                {touched.email && email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid ? <CheckCircle2 size={15} className="text-green-400" /> : <X size={15} className="text-red-400" />}
                  </div>
                )}
              </div>
              <AnimatePresence>
                {emailInvalid && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-red-400 flex items-center gap-1">
                    <X size={10} />Please enter a valid email
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-white/70 text-[13px]">Password</Label>
                <a href="#" className="text-[12px] text-violet-400 hover:text-violet-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => touch("password")}
                  className={cn(
                    "bg-white/4 border-white/8 text-white placeholder:text-white/25 h-11 pr-10 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60",
                    passwordValid && "border-green-500/50 bg-green-950/10",
                    passwordInvalid && "border-red-500/50 bg-red-950/10"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <AnimatePresence>
                {passwordInvalid && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-red-400 flex items-center gap-1">
                    <X size={10} />Must be at least 8 characters
                  </motion.p>
                )}
                {passwordValid && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-[11px] text-green-400 flex items-center gap-1">
                    <Check size={10} />Looks good
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember me */}
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2.5 w-full text-left"
            >
              <div className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200",
                rememberMe
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 border-violet-500"
                  : "bg-white/5 border-white/12"
              )}>
                {rememberMe && <Check size={11} className="text-white" />}
              </div>
              <span className="text-sm text-white/55">Remember me for 30 days</span>
            </button>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-11 text-[15px] font-semibold gap-2 border-0",
                canSubmit
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_4px_24px_rgba(124,58,237,0.35)]"
                  : "bg-white/5 text-white/25 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 size={16} /></motion.div>Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </Button>
          </form>

          <p className="text-center text-[13px] text-white/35 mt-5">
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign up free</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
