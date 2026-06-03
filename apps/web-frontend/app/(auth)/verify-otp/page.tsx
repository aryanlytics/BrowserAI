"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2, ArrowLeft, RotateCcw, CheckCircle2, Mic } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "you@example.com";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const canResend = countdown <= 0;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const allFilled = otp.every((d) => d !== "");

  const focusInput = (index: number) => inputRefs.current[index]?.focus();

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (digits.length > 0) {
          const newOtp = [...otp];
          for (let i = 0; i < OTP_LENGTH; i++) newOtp[i] = digits[i] || "";
          setOtp(newOtp);
          setHasError(false);
          setTimeout(() => focusInput(Math.min(digits.length, OTP_LENGTH - 1)), 0);
        }
        return;
      }
      const digit = value.replace(/\D/g, "").slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);
      setHasError(false);
      if (digit && index < OTP_LENGTH - 1) focusInput(index + 1);
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (otp[index]) { const n = [...otp]; n[index] = ""; setOtp(n); }
        else if (index > 0) focusInput(index - 1);
      } else if (e.key === "ArrowLeft" && index > 0) focusInput(index - 1);
      else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) focusInput(index + 1);
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => { e.preventDefault(); handleChange(0, e.clipboardData.getData("text")); },
    [handleChange]
  );

  const handleVerify = async () => {
    if (!allFilled) return;
    setIsLoading(true);
    setHasError(false);
    await new Promise((r) => setTimeout(r, 2000));
    if (otp.join("") === "000000") {
      setHasError(true);
      setIsLoading(false);
      setOtp(Array(OTP_LENGTH).fill(""));
      focusInput(0);
      return;
    }
    setIsVerified(true);
    setIsLoading(false);
    await new Promise((r) => setTimeout(r, 1500));
    window.location.href = "/dashboard";
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(60);
    setOtp(Array(OTP_LENGTH).fill(""));
    setHasError(false);
    focusInput(0);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 bg-[#0a0a0f] text-white relative overflow-hidden"
      style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "64px 64px" }}
    >
      {/* Ambient blobs */}
      <div className="absolute rounded-full pointer-events-none" style={{ width: 500, height: 500, background: "rgba(124,58,237,0.1)", top: "20%", left: "50%", transform: "translateX(-50%)", filter: "blur(180px)" }} />
      <div className="absolute rounded-full pointer-events-none" style={{ width: 300, height: 300, background: "rgba(79,70,229,0.08)", bottom: "10%", right: "10%", filter: "blur(180px)" }} />

      <AnimatePresence mode="wait">
        {isVerified ? (
          /* ── Success state ── */
          <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
              className="w-22 h-22 rounded-2xl bg-green-950/40 border border-green-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <CheckCircle2 size={40} className="text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Verified!</h2>
            <p className="text-white/40 text-sm">Redirecting to your dashboard...</p>
          </motion.div>
        ) : (
          /* ── OTP card ── */
          <motion.div key="otp-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="w-full max-w-[460px] relative z-10">

            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-12 shadow-[0_32px_64px_rgba(0,0,0,0.3)]">
              {/* Logo */}
              <div className="flex justify-center mb-7">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Mic size={20} className="text-white" />
                </div>
              </div>

              {/* Shield icon */}
              <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                className="flex justify-center mb-6">
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-950/80 to-indigo-950/80 border border-violet-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.25)]">
                  <ShieldCheck size={36} className="text-violet-400" />
                  <motion.div
                    className="absolute inset-[-2px] rounded-2xl border border-violet-500/30"
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </div>
              </motion.div>

              <h1 className="text-2xl font-extrabold text-center tracking-tight mb-2.5">Check your email</h1>
              <p className="text-sm text-white/45 text-center leading-relaxed mb-2">
                We sent a 6-digit verification code to
              </p>

              {/* Email pill */}
              <div className="flex justify-center mb-8">
                <Badge variant="outline" className="px-4 py-1.5 text-violet-300 bg-violet-950/50 border-violet-500/25 gap-2 text-[13px] max-w-full overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </Badge>
              </div>

              {/* OTP inputs */}
              <div className="flex gap-2.5 justify-center mb-3">
                {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    value={otp[i]}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileFocus={{ scale: 1.05 }}
                    className={cn(
                      "w-[52px] h-[60px] text-center text-2xl font-bold rounded-xl outline-none transition-all duration-200",
                      "bg-white/4 border-2 border-white/8 text-white",
                      "focus:border-violet-500 focus:bg-violet-950/20 focus:shadow-[0_0_0_3px_rgba(124,58,237,0.2)]",
                      otp[i] && "border-violet-500/60 bg-violet-950/15",
                      hasError && "border-red-500/60 bg-red-950/10 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                    )}
                  />
                ))}
              </div>

              {/* Error */}
              <AnimatePresence>
                {hasError && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="mb-4 px-4 py-2.5 bg-red-950/30 border border-red-500/20 rounded-lg text-center">
                    <p className="text-[13px] text-red-400">Invalid code. Please try again or request a new one.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Verify button */}
              <Button
                onClick={handleVerify}
                disabled={!allFilled || isLoading}
                className={cn(
                  "w-full h-11 text-[15px] font-semibold gap-2 mb-5 border-0",
                  allFilled
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_4px_24px_rgba(124,58,237,0.35)]"
                    : "bg-white/5 text-white/25 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 size={16} /></motion.div>Verifying...</>
                ) : (
                  <><ShieldCheck size={16} />Verify Code</>
                )}
              </Button>

              {/* Resend */}
              <div className="text-center mb-4">
                <button
                  onClick={handleResend}
                  disabled={!canResend}
                  className={cn(
                    "text-[13px] inline-flex items-center gap-1.5 transition-colors",
                    canResend ? "text-violet-400 hover:text-violet-300 cursor-pointer" : "text-white/25 cursor-default"
                  )}
                >
                  <RotateCcw size={12} />
                  {canResend ? "Resend verification code" : `Resend in ${countdown}s`}
                </button>
              </div>

              {/* Back */}
              <div className="text-center">
                <a href="/sign-up" className="text-[13px] text-white/25 hover:text-white/50 inline-flex items-center gap-1.5 transition-colors">
                  <ArrowLeft size={12} />Wrong email? Go back
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-12 h-12 rounded-xl bg-violet-950/30 border border-violet-500/20 flex items-center justify-center">
          <Loader2 size={20} className="text-violet-500 animate-spin" />
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
