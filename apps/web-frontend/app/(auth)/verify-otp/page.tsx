"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import api from '@/lib/api';
import { toast } from 'sonner';
import { verifyOtpSchema } from '@/models/Zod';



// ─── Component ────────────────────────────────────────────────────────────────
const VerifyOtpContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    otp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleinput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow digits to be typed
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    
    setFormData((prev) => ({
      ...prev,
      [name]: cleanValue
    }));
    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const result = verifyOtpSchema.safeParse(formData);
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }
    
    if (!email) {
      toast.error("Missing email address", {
        description: "Please register again or check your signup link.",
      });
      return;
    }

    setErrors({});
    setIsLoading(true);
    const toastId = toast.loading("Verifying your code...");

    try {
      await api.post('/api/auth/verify-otp', {
        email,
        otp: result.data.otp,
      });

      toast.success("Account verified successfully!", { id: toastId });
      router.push('/dashboard');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error("Verification failed", {
        id: toastId,
        description: axiosError.response?.data?.message || "Invalid or expired verification code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Missing email address");
      return;
    }

    setIsResending(true);
    const toastId = toast.loading("Resending code...");

    try {
      await api.post('/api/auth/resend-otp', { email });
      toast.success("Verification code resent!", {
        id: toastId,
        description: "Please check your inbox.",
      });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error("Resend failed", {
        id: toastId,
        description: axiosError.response?.data?.message || "Failed to resend code. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Browser<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">AI</span>
            </span>
          </Link>
        </div>

        <Card className="bg-[#0f0f16]/80 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="bg-white/5 p-3 rounded-full border border-white/10">
                <KeyRound className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Verify your email</CardTitle>
            <CardDescription className="text-center text-white/60">
              {email ? `Enter the 6-digit verification code sent to ${email}` : "Enter the 6-digit verification code sent to your email address."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="otp" className={`text-center block ${errors.otp ? "text-red-400" : ""}`}>Verification Code</Label>
                <div className="relative max-w-[200px] mx-auto">
                  <Input 
                    autoComplete="one-time-code" 
                    name="otp" 
                    value={formData.otp} 
                    onChange={handleinput} 
                    id="otp" 
                    type="text" 
                    inputMode="numeric"
                    placeholder="000000" 
                    maxLength={6}
                    disabled={isLoading}
                    className={`bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono h-14 focus-visible:ring-blue-500 ${errors.otp ? "border-red-500/50 focus-visible:ring-red-500" : "border-white/10"}`} 
                  />
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-400 flex items-center justify-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" /> {errors.otp}
                  </p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying Account...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
            <p className="text-center text-sm text-white/60">
              Didn&apos;t receive a code?{" "}
              <button 
                type="button" 
                onClick={handleResendCode}
                disabled={isResending}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium transition-colors disabled:opacity-50"
              >
                {isResending ? "Resending..." : "Resend code"}
              </button>
            </p>
            <p className="text-center text-xs text-white/40 mt-2">
              <Link href="/sign-in" className="hover:text-white transition-colors">
                Back to sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const VerifyOtp = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  )
}

export default VerifyOtp;