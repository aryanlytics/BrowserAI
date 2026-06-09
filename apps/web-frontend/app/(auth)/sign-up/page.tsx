"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
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
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from '@/lib/auth-client'

// ─── Zod schema ───────────────────────────────────────────────────────────────
const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  
  // ─── Password strength helper ─────────────────────────────────────────────────
  function getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
  } {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Fair", color: "bg-orange-400" };
    if (score <= 3) return { score, label: "Good", color: "bg-yellow-400" };
    if (score <= 4) return { score, label: "Strong", color: "bg-green-400" };
    return { score, label: "Very Strong", color: "bg-emerald-400" };
  }
  
// ─── Component ────────────────────────────────────────────────────────────────
const SignUp = () => {
  

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ── Client-side validation ────────────────────────────────────────────
    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);

      toast.error("Please fix the highlighted fields before continuing.", {
        description: result.error.issues[0]?.message,
      });
      return;
    }

    setIsLoading(true);

    const toastId = toast.loading("Creating your account…");

    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error("Sign-up failed", {
          id: toastId,
          description:
            error.message ?? "Something went wrong. Please try again.",
        });
        return;
      }

      if (data) {
        toast.success("Account created!", {
          id: toastId,
          description:
            "We've sent a verification email to your inbox. Please check it to activate your account.",
          duration: 6000,
        });
        
      }
    } catch {
      toast.error("Unexpected error", {
        id: toastId,
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const toastId = toast.loading("Redirecting to Google…");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      toast.error("Google sign-up failed", {
        id: toastId,
        description: "Could not connect to Google. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden p-4">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-600/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="Go to BrowserAI home"
          >
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
              Create your account
            </CardTitle>
            <CardDescription className="text-center text-white/55">
              Start automating your browser with the power of AI
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <form
              id="sign-up-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="full-name"
                  className={`text-sm font-medium ${errors.fullName ? "text-red-400" : "text-white/80"}`}
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      errors.fullName ? "text-red-400" : "text-white/35"
                    }`}
                  />
                  <Input
                    id="full-name"
                    name="fullName"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInput}
                    disabled={isLoading}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={
                      errors.fullName ? "fullName-error" : undefined
                    }
                    className={`bg-white/5 text-white pl-10 placeholder:text-white/30 border transition-all
                      focus-visible:ring-blue-500/50 focus-visible:border-blue-500/60
                      ${
                        errors.fullName
                          ? "border-red-500/60 focus-visible:ring-red-500/30"
                          : "border-white/10 hover:border-white/20"
                      }`}
                  />
                </div>
                {errors.fullName && (
                  <p
                    id="fullName-error"
                    role="alert"
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
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
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInput}
                    disabled={isLoading}
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

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className={`text-sm font-medium ${errors.password ? "text-red-400" : "text-white/80"}`}
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      errors.password ? "text-red-400" : "text-white/35"
                    }`}
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleInput}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : "password-strength"
                    }
                    className={`bg-white/5 text-white pl-10 pr-10 placeholder:text-white/30 border transition-all
                      focus-visible:ring-blue-500/50 focus-visible:border-blue-500/60
                      ${
                        errors.password
                          ? "border-red-500/60 focus-visible:ring-red-500/30"
                          : "border-white/10 hover:border-white/20"
                      }`}
                  />
                  <button
                    type="button"
                    id="toggle-password"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password strength bar */}
                {formData.password && (
                  <div id="password-strength" className="space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs ${
                        passwordStrength.score <= 1
                          ? "text-red-400"
                          : passwordStrength.score <= 2
                            ? "text-orange-400"
                            : passwordStrength.score <= 3
                              ? "text-yellow-400"
                              : "text-green-400"
                      }`}
                    >
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className={`text-sm font-medium ${errors.confirmPassword ? "text-red-400" : "text-white/80"}`}
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      errors.confirmPassword ? "text-red-400" : "text-white/35"
                    }`}
                  />
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={handleInput}
                    disabled={isLoading}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword ? "confirmPassword-error" : undefined
                    }
                    className={`bg-white/5 text-white pl-10 pr-10 placeholder:text-white/30 border transition-all
                      focus-visible:ring-blue-500/50 focus-visible:border-blue-500/60
                      ${
                        errors.confirmPassword
                          ? "border-red-500/60 focus-visible:ring-red-500/30"
                          : "border-white/10 hover:border-white/20"
                      }`}
                  />
                  <button
                    type="button"
                    id="toggle-confirm-password"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    role="alert"
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                id="sign-up-submit"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400
                  text-white font-semibold h-9 gap-2 shadow-lg shadow-blue-500/20 transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-0">
            {/* Divider */}
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
                <span className="bg-[#0f0f16] px-3 text-white/40">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <Button
              id="google-sign-up"
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignUp}
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20
                hover:text-white transition-all duration-200 gap-2.5"
            >
              {/* Google SVG */}
              <svg
                role="img"
                aria-label="Google logo"
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="currentColor"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Sign in link */}
            <p className="text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-white/30">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-white/50 transition-colors"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-white/50 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default SignUp;