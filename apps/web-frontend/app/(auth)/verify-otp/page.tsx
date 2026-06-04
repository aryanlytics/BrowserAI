"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, KeyRound, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  otp: z.string().trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d+$/, "Verification code must contain only numbers"),
});

const VerifyOtp = () => {
  const [formData, setFormData] = useState({
    otp: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    
    setErrors({});
    console.log("Validation passed! Verifying OTP:", result.data.otp);
    // Continue with verification logic...
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
              Browser<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">AI</span>
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
              Enter the 6-digit verification code sent to your email address.
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
                    className={`bg-white/5 text-white text-center text-2xl tracking-[0.5em] font-mono h-14 focus-visible:ring-blue-500 ${errors.otp ? "border-red-500/50 focus-visible:ring-red-500" : "border-white/10"}`} 
                  />
                </div>
                {errors.otp && (
                  <p className="text-xs text-red-400 flex items-center justify-center gap-1 mt-2">
                    <AlertCircle className="w-3 h-3" /> {errors.otp}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6">
                Verify Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
            <p className="text-center text-sm text-white/60">
              Didn't receive a code?{" "}
              <button type="button" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium transition-colors">
                Resend code
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

export default VerifyOtp;