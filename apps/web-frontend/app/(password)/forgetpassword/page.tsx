"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import api from "@/lib/api";
import { forgetPasswordSchema } from "@browser-ai/validators/zod/auth";

const ResetPasswordPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = forgetPasswordSchema.safeParse({ email });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    const toastId = toast.loading("Sending OTP...");

    try {
      await api.post("/api/auth/forgotpassword", { email });

      toast.success("OTP sent successfully", { id: toastId });

      router.push(
        `/forgetpasswordotp?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          "An error occurred. Please try again.";

        toast.error("Request Failed", {
          id: toastId,
          description: message,
        });

        setErrors({ email: message });
      } else {
        toast.error("Unexpected error", {
          id: toastId,
          description: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 group-hover:bg-blue-600/30 group-hover:border-blue-400/50 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Browser
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">
                AI
              </span>
            </span>
          </Link>
        </div>

        <Card className="bg-[#0f0f16]/80 backdrop-blur-xl border-white/10 text-white shadow-2xl shadow-black/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">
              Find Your Account
            </CardTitle>
            <CardDescription className="text-center text-white/55">
              We&apos;ll send a verification code to your email
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submitHandler} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className={`text-sm font-medium ${errors.email ? "text-red-400" : "text-white/80"}`}
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      errors.email ? "text-red-400" : "text-white/35"
                    }`}
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleInput}
                    autoComplete="email"
                    disabled={isLoading}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`bg-white/5 text-white pl-10 placeholder:text-white/30 border transition-all
                      focus-visible:ring-blue-500/50 focus-visible:border-blue-500/60
                      ${
                        errors.email
                          ? "border-red-500/60 focus-visible:ring-red-500/30"
                          : "border-white/10 hover:border-white/20"
                      }`}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                  text-white font-semibold h-9 gap-2 shadow-lg shadow-blue-500/20 transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP…
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center pb-6">
            <Link
              href="/signin"
              className="text-xs text-white/35 hover:text-white/60 transition-colors"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;