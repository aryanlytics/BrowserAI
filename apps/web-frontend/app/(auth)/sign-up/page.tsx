"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Eye, EyeOff, Check, X, Loader2, ArrowRight, CheckCircle2, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── Validation ─────────────────────────────────────────────────────────────────
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /\d/.test(pw),
    special: /[!@#$%^&*]/.test(pw),
    valid: pw.length >= 8 && /[A-Z]/.test(pw) && /\d/.test(pw),
  };
}

// ── Password strength bar ──────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = validatePassword(password);
  const strength = [checks.length, checks.upper, checks.number, checks.special].filter(Boolean).length;
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const textColors = ["", "text-red-400", "text-amber-400", "text-blue-400", "text-green-400"];

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-1.5 space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn("flex-1 h-[3px] rounded-full transition-colors duration-300", i < strength ? colors[strength] : "bg-white/8")} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "8+ chars", ok: checks.length },
            { label: "Uppercase", ok: checks.upper },
            { label: "Number", ok: checks.number },
            { label: "Symbol", ok: checks.special },
          ].map((c) => (
            <span key={c.label} className={cn("text-[10px] flex items-center gap-1", c.ok ? "text-green-400" : "text-white/25")}>
              {c.ok ? <Check size={9} /> : <X size={9} />}{c.label}
            </span>
          ))}
        </div>
        {strength > 0 && <span className={cn("text-[11px] font-semibold", textColors[strength])}>{labels[strength]}</span>}
      </div>
    </motion.div>
  );
}

// ── Left decorative panel ──────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="flex-1 hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden min-h-screen"
      style={{ background: "linear-gradient(135deg, #1a0a3c, #0d0625, #0a0a1a)" }}>
      {/* Blobs */}
      <div className="absolute rounded-full pointer-events-none" style={{ width: 400, height: 400, background: "rgba(124,58,237,0.25)", top: "20%", left: "20%", transform: "translate(-50%,-50%)", filter: "blur(180px)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, background: "rgba(79,70,229,0.15)", bottom: "10%", right: "10%", filter: "blur(180px)" }} />
      {/* Grid */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight mb-2.5">
            Your AI browser<br />
            <span className="bg-gradient-to-r from-violet-300 to-indigo-400 bg-clip-text text-transparent">agent awaits</span>
          </h2>
          <p className="text-sm text-white/40 leading-relaxed">Thousands of tasks. One voice command. Zero effort.</p>
        </motion.div>

        {/* Floating cards */}
        {[
          { delay: 0.4, animClass: "animate-float", icon: <CheckCircle2 size={14} className="text-green-400" />, iconBg: "bg-green-950/60 border-green-500/25", title: "Task completed", sub: "Downloaded quarterly_report.pdf", titleColor: "text-green-400" },
          { delay: 0.55, animClass: "animate-float-delay-1 ml-8", icon: <Globe size={14} className="text-violet-400" />, iconBg: "bg-violet-950/60 border-violet-500/25", title: "Now browsing", sub: "youtube.com/results", titleColor: "text-white/80" },
          { delay: 0.7, animClass: "animate-float-delay-2", icon: <Mic size={14} className="text-indigo-400" />, iconBg: "bg-indigo-950/60 border-indigo-500/25", title: "Speaking results", sub: '"Here are the top 5 results..."', titleColor: "text-white/80" },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: card.delay }}
            className={cn("mb-3.5", card.animClass)}>
            <Card className="border-white/8 bg-white/[0.04] backdrop-blur-sm">
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", card.iconBg)}>{card.icon}</div>
                <div>
                  <p className={cn("text-xs font-semibold", card.titleColor)}>{card.title}</p>
                  <p className="text-[11px] text-white/35">{card.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="flex gap-2 mt-8 flex-wrap">
          {[{ icon: <Shield size={11} />, label: "SOC 2 Compliant" }, { icon: <Check size={11} />, label: "GDPR Ready" }, { icon: <CheckCircle2 size={11} />, label: "No data stored" }].map((b) => (
            <Badge key={b.label} variant="outline" className="text-white/40 border-white/8 bg-white/4 gap-1 text-[11px]">{b.icon}{b.label}</Badge>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });

  const touch = (field: keyof typeof touched) => setTouched((t) => ({ ...t, [field]: true }));

  const nameValid = touched.name && fullName.trim().length >= 2;
  const nameInvalid = touched.name && fullName.trim().length < 2 && fullName.length > 0;
  const emailValid = touched.email && validateEmail(email);
  const emailInvalid = touched.email && !validateEmail(email) && email.length > 0;
  const pwChecks = validatePassword(password);
  const passwordValid = touched.password && pwChecks.valid;
  const passwordInvalid = touched.password && !pwChecks.valid && password.length > 0;
  const confirmValid = touched.confirm && confirmPassword === password && password.length > 0;
  const confirmInvalid = touched.confirm && confirmPassword !== password && confirmPassword.length > 0;

  const canSubmit = fullName.trim().length >= 2 && validateEmail(email) && pwChecks.valid && confirmPassword === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!canSubmit) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsLoading(false);
    window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-white">
      <LeftPanel />

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-9">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Mic size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">BrowserAI</span>
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight mb-1.5">Create your account</h1>
          <p className="text-sm text-white/40 mb-7">Start automating your browser with AI today.</p>

          {/* Google OAuth */}
          <Button variant="outline" className="w-full mb-5 border-white/10 bg-white/5 hover:bg-white/8 text-white hover:text-white gap-2.5 h-11">
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
            <span className="text-xs text-white/30">or sign up with email</span>
            <div className="flex-1 h-px bg-white/7" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-[13px]">Full Name</Label>
              <div className="relative">
                <Input placeholder="Jane Smith" value={fullName}
                  onChange={(e) => setFullName(e.target.value)} onBlur={() => touch("name")}
                  className={cn("bg-white/4 border-white/8 text-white placeholder:text-white/25 h-11 pr-10 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60",
                    nameValid && "border-green-500/50 bg-green-950/10",
                    nameInvalid && "border-red-500/50 bg-red-950/10"
                  )} />
                {touched.name && fullName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {nameValid ? <CheckCircle2 size={15} className="text-green-400" /> : <X size={15} className="text-red-400" />}
                  </div>
                )}
              </div>
              <AnimatePresence>
                {nameInvalid && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-red-400 flex items-center gap-1"><X size={10} />At least 2 characters required</motion.p>}
                {nameValid && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-green-400 flex items-center gap-1"><Check size={10} />Looks good</motion.p>}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-[13px]">Email Address</Label>
              <div className="relative">
                <Input type="email" placeholder="jane@company.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} onBlur={() => touch("email")}
                  className={cn("bg-white/4 border-white/8 text-white placeholder:text-white/25 h-11 pr-10 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60",
                    emailValid && "border-green-500/50 bg-green-950/10",
                    emailInvalid && "border-red-500/50 bg-red-950/10"
                  )} />
                {touched.email && email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid ? <CheckCircle2 size={15} className="text-green-400" /> : <X size={15} className="text-red-400" />}
                  </div>
                )}
              </div>
              <AnimatePresence>
                {emailInvalid && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-red-400 flex items-center gap-1"><X size={10} />Please enter a valid email</motion.p>}
                {emailValid && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-green-400 flex items-center gap-1"><Check size={10} />Looks good</motion.p>}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-[13px]">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Create a strong password" value={password}
                  onChange={(e) => { setPassword(e.target.value); touch("password"); }} onBlur={() => touch("password")}
                  className={cn("bg-white/4 border-white/8 text-white placeholder:text-white/25 h-11 pr-10 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60",
                    passwordValid && "border-green-500/50 bg-green-950/10",
                    passwordInvalid && "border-red-500/50 bg-red-950/10"
                  )} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-[13px]">Confirm Password</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Re-enter your password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); touch("confirm"); }} onBlur={() => touch("confirm")}
                  className={cn("bg-white/4 border-white/8 text-white placeholder:text-white/25 h-11 pr-10 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/60",
                    confirmValid && "border-green-500/50 bg-green-950/10",
                    confirmInvalid && "border-red-500/50 bg-red-950/10"
                  )} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <AnimatePresence>
                {confirmInvalid && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-red-400 flex items-center gap-1"><X size={10} />Passwords do not match</motion.p>}
                {confirmValid && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[11px] text-green-400 flex items-center gap-1"><Check size={10} />Passwords match</motion.p>}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <Button type="submit" disabled={isLoading} className={cn("w-full h-11 text-[15px] font-semibold gap-2 mt-1 border-0",
              canSubmit
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_4px_24px_rgba(124,58,237,0.35)]"
                : "bg-white/5 text-white/25 cursor-not-allowed"
            )}>
              {isLoading ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 size={16} /></motion.div>Creating your account...</>
              ) : (
                <>Create Account <ArrowRight size={16} /></>
              )}
            </Button>
          </form>

          <p className="text-center text-[13px] text-white/35 mt-5">
            Already have an account?{" "}
            <a href="/sign-in" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign in</a>
          </p>
          <p className="text-center text-[11px] text-white/20 mt-4 leading-relaxed">
            By creating an account you agree to our{" "}
            <a href="#" className="text-white/35 hover:text-white/55 transition-colors">Terms</a>{" "}and{" "}
            <a href="#" className="text-white/35 hover:text-white/55 transition-colors">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
