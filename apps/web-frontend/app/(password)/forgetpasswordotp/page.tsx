"use client";

import React, { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, KeyRound, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { verifyOtpSchema } from '@browser-ai/validators/zod/auth';

const COUNTDOWN = 120;

const VerifyOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // State initialized to full duration — no need to setState inside the effect.
  const [seconds, setSeconds] = useState(COUNTDOWN);
  // Incrementing this restarts the timer effect (used after resend).
  const [resetKey, setResetKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Countdown ─────────────────────────────────────────────────────────────
  // Effect only sets up the interval — no synchronous setState calls here.
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetKey]);

  const canResend = seconds === 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  // ── Verify ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = verifyOtpSchema.safeParse({ email, otp });
    if (!result.success) {
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email');
      if (emailIssue) {
        toast.error('Missing email', { description: 'Please sign up again.' });
        return;
      }
      setOtpError(result.error.issues[0]?.message ?? 'Invalid code');
      return;
    }

    setOtpError('');
    setIsLoading(true);
    const toastId = toast.loading('Verifying...');
    try {
      await api.post('/api/auth/newpassword', { email, otp });
      toast.success('Email verified!', { id: toastId });
      router.push(`/resetpassword?email=${email}`);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error('Verification failed', { id: toastId, description: msg || 'Invalid or expired code.' });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend ────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!email) { toast.error('Missing email'); return; }
    setIsResending(true);
    const toastId = toast.loading('Resending code...');
    try {
      await api.post('/api/auth/resendotp', { email });
      toast.success('New code sent!', { id: toastId, description: 'Check your inbox.' });
      setOtp('');
      setOtpError('');
      // Reset state in the event handler (allowed), then bump resetKey
      // to re-trigger the timer effect.
      setSeconds(COUNTDOWN);
      setResetKey((k) => k + 1);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error('Resend failed', { id: toastId, description: msg || 'Try again.' });
    } finally {
      setIsResending(false);
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 group-hover:bg-blue-600/30 transition-all">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Browser<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">AI</span>
            </span>
          </Link>
        </div>

        <Card className="bg-[#0f0f16]/80 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/5 p-3 rounded-full border border-white/10">
                <KeyRound className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription className="text-white/60 text-sm">
              Enter the 6-digit code sent to{' '}
              {email && <span className="text-white/80 font-medium">{email}</span>}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label htmlFor="otp" className={`block text-center text-sm ${otpError ? 'text-red-400' : 'text-white/70'}`}>
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError('');
                  }}
                  disabled={isLoading}
                  className={`text-center text-2xl tracking-[0.5em] font-mono h-14 bg-white/5 text-white
                    max-w-[220px] mx-auto block focus-visible:ring-blue-500/50
                    ${otpError ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}`}
                />
                {otpError && (
                  <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {otpError}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verifying...</> : 'Verify Account'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2 pb-6 text-center">
            {/* Countdown / Resend */}
            {canResend ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={isResending}
                className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white gap-2"
              >
                {isResending
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                  : <><RefreshCw className="w-4 h-4" />Resend code</>}
              </Button>
            ) : (
              <p className="text-sm text-white/40">
                Resend available in <span className="font-mono text-white/60">{mm}:{ss}</span>
              </p>
            )}

            <Link href="/signin" className="text-xs text-white/35 hover:text-white/60 transition-colors">
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const VerifyOtp = () => (
  <Suspense fallback={
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  }>
    <VerifyOtpContent />
  </Suspense>
);

export default VerifyOtp;