"use client";

import React, { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, KeyRound, AlertCircle, Loader2, RefreshCw, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import api from '@/lib/api';
import { toast } from 'sonner';
import { verifyOtpSchema } from '@browser-ai/validators/zod/auth';

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNTDOWN_SECONDS = 120; // 2 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
const VerifyOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  // ── Form state ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ otp: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Countdown state ──────────────────────────────────────────────────────
  // Initialized to full duration so the first render is already correct —
  // no need to call setState synchronously inside an effect.
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // Incrementing this value re-triggers the timer effect (used on resend).
  const [resetKey, setResetKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Timer effect ──────────────────────────────────────────────────────────
  // This effect ONLY sets up / tears down setInterval (an external subscription).
  // No synchronous setState calls live here — state is reset in event handlers.
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetKey]);

  // ── Input handler ────────────────────────────────────────────────────────
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const clean = value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, [name]: clean }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = verifyOtpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!email) {
      toast.error('Missing email address', {
        description: 'Please register again or check your signup link.',
      });
      return;
    }

    setErrors({});
    setIsLoading(true);
    const toastId = toast.loading('Verifying your code...');

    try {
      await api.post('/api/auth/verifyotp', {
        email,
        otp: result.data.otp,
      });

      toast.success('Account verified successfully!', { id: toastId });
      router.push('/dashboard');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error('Verification failed', {
        id: toastId,
        description:
          axiosError.response?.data?.message || 'Invalid or expired verification code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ───────────────────────────────────────────────────────────
  const handleResendCode = async () => {
    if (!email) {
      toast.error('Missing email address');
      return;
    }

    setIsResending(true);
    const toastId = toast.loading('Resending code...');

    try {
      await api.post('/api/auth/resendotp', { email });

      toast.success('Verification code resent!', {
        id: toastId,
        description: 'Please check your inbox for a fresh code.',
      });

      // Reset OTP input and restart the 2-minute countdown.
      // State resets happen here (event handler), NOT inside an effect.
      setFormData({ otp: '' });
      setCountdown(COUNTDOWN_SECONDS);
      setCanResend(false);
      setResetKey((k) => k + 1); // ← re-triggers the timer useEffect
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error('Resend failed', {
        id: toastId,
        description:
          axiosError.response?.data?.message || 'Failed to resend code. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  // ── Derived visuals ──────────────────────────────────────────────────────
  // Progress ring: how much of the 2-min circle is filled
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = countdown / COUNTDOWN_SECONDS; // 1 → 0
  const strokeDashoffset = circumference * (1 - progress);
  const isAlmostExpired = countdown <= 30 && countdown > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 group-hover:bg-blue-600/30 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Browser<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">AI</span>
            </span>
          </Link>
        </div>

        <Card className="bg-[#0f0f16]/80 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            {/* Animated countdown ring */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                {/* Outer glow ring */}
                <div className={`absolute inset-0 rounded-full blur-md transition-all duration-500 ${
                  canResend
                    ? 'bg-orange-500/20'
                    : isAlmostExpired
                    ? 'bg-orange-500/15'
                    : 'bg-blue-500/15'
                }`} />

                <svg width="80" height="80" className="relative -rotate-90">
                  {/* Track */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="4"
                  />
                  {/* Animated progress */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={canResend ? '#f97316' : isAlmostExpired ? '#fb923c' : '#3b82f6'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {canResend ? (
                    <RefreshCw className="w-6 h-6 text-orange-400" />
                  ) : (
                    <KeyRound className={`w-6 h-6 transition-colors duration-300 ${isAlmostExpired ? 'text-orange-400' : 'text-blue-400'}`} />
                  )}
                </div>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
            <CardDescription className="text-center text-white/60 text-sm leading-relaxed">
              {email
                ? <>Code sent to <span className="text-white/80 font-medium">{email}</span></>
                : 'Enter the 6-digit verification code sent to your email.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Countdown display */}
            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border transition-all duration-500 ${
              canResend
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-300'
                : isAlmostExpired
                ? 'bg-orange-500/8 border-orange-500/15 text-orange-400'
                : 'bg-white/3 border-white/8 text-white/50'
            }`}>
              <Clock className="w-4 h-4 shrink-0" />
              {canResend ? (
                <span className="text-sm font-medium">Code expired — request a new one below</span>
              ) : (
                <span className="text-sm tabular-nums">
                  Code expires in{' '}
                  <span className={`font-bold font-mono ${isAlmostExpired ? 'text-orange-300' : 'text-white/70'}`}>
                    {formatTime(countdown)}
                  </span>
                </span>
              )}
            </div>

            {/* OTP form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className={`text-center block text-sm font-medium ${errors.otp ? 'text-red-400' : 'text-white/70'}`}
                >
                  Verification Code
                </Label>
                <div className="relative max-w-[220px] mx-auto">
                  <Input
                    autoComplete="one-time-code"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInput}
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading || canResend}
                    aria-invalid={!!errors.otp}
                    aria-describedby={errors.otp ? 'otp-error' : undefined}
                    className={`bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono h-14
                      focus-visible:ring-blue-500/50 focus-visible:border-blue-500/60 transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${errors.otp
                        ? 'border-red-500/50 focus-visible:ring-red-500/30'
                        : 'border-white/10 hover:border-white/20'
                      }`}
                  />
                </div>
                {errors.otp && (
                  <p id="otp-error" role="alert" className="text-xs text-red-400 flex items-center justify-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.otp}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || canResend}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold mt-2
                  shadow-lg shadow-blue-500/20 transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Account'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
            {/* Resend section — hidden until countdown ends */}
            <div className="w-full text-center min-h-[44px] flex items-center justify-center">
              {canResend ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="border-orange-500/30 bg-orange-500/5 text-orange-300 hover:bg-orange-500/15
                    hover:border-orange-400/50 hover:text-orange-200 transition-all duration-200
                    disabled:opacity-60 gap-2"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending new code...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend verification code
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-xs text-white/35">
                  Resend option available after timer expires
                </p>
              )}
            </div>

            {/* Back to sign in */}
            <p className="text-center text-xs text-white/35 mt-1">
              <Link href="/signin" className="hover:text-white/70 transition-colors underline underline-offset-4">
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// ─── Suspense wrapper (required for useSearchParams) ──────────────────────────
const VerifyOtp = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-white/40 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
};

export default VerifyOtp;