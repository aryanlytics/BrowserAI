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
  CircleCheckBig,
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

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { registerSchema } from "@browser-ai/validators/zod/auth";




// ─── Component ────────────────────────────────────────────────────────────────
const SignUp = () => {
  const router = useRouter();

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

  const hasMinLength = formData.password.length >= 8;
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasCapital = /[A-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ── Handle Submit ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // ── Client-side validation ────────────────────────────────────────────
    const result = registerSchema.safeParse(formData);
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
      await api.post('/api/auth/signup', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Verify your email address", {
        id: toastId,
        description:
          "We've sent a verification OTP to your email. Please enter it to proceed.",
        duration: 6000,
      });

      router.push(`/verifyotp?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message ?? "Something went wrong. Please try again.";
      toast.error("Sign-up failed", {
        id: toastId,
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    toast.info("Google sign-up is not available right now.", {
      description: "Please register using email and password.",
    });
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

                {/* Password requirement checks */}
                {formData.password && (
                  <div className="space-y-1.5 mt-2 bg-white/2 border border-white/5 rounded-lg p-3 text-xs">
                    <p className="text-white/60 font-medium mb-1">Must contain at least:</p>
                    <div className="space-y-1">
                      {/* 8 characters minimum */}
                      <div className={`flex items-center gap-2 transition-colors duration-300 ${
                        hasMinLength ? "text-green-400" : "text-white/40"
                      }`}>
                        <CircleCheckBig className={`w-4 h-4 transition-transform duration-300 ${
                          hasMinLength ? "text-green-400 scale-100" : "text-white/20 scale-95"
                        }`} />
                        <span>8 characters minimum</span>
                      </div>

                      {/* One lowercase character */}
                      <div className={`flex items-center gap-2 transition-colors duration-300 ${
                        hasLowercase ? "text-green-400" : "text-white/40"
                      }`}>
                        <CircleCheckBig className={`w-4 h-4 transition-transform duration-300 ${
                          hasLowercase ? "text-green-400 scale-100" : "text-white/20 scale-95"
                        }`} />
                        <span>One lowercase character (a-z)</span>
                      </div>

                      {/* One uppercase character */}
                      <div className={`flex items-center gap-2 transition-colors duration-300 ${
                        hasCapital ? "text-green-400" : "text-white/40"
                      }`}>
                        <CircleCheckBig className={`w-4 h-4 transition-transform duration-300 ${
                          hasCapital ? "text-green-400 scale-100" : "text-white/20 scale-95"
                        }`} />
                        <span>One uppercase character (A-Z)</span>
                      </div>

                      {/* One number */}
                      <div className={`flex items-center gap-2 transition-colors duration-300 ${
                        hasNumber ? "text-green-400" : "text-white/40"
                      }`}>
                        <CircleCheckBig className={`w-4 h-4 transition-transform duration-300 ${
                          hasNumber ? "text-green-400 scale-100" : "text-white/20 scale-95"
                        }`} />
                        <span>One number (0-9)</span>
                      </div>

                      {/* One special character */}
                      <div className={`flex items-center gap-2 transition-colors duration-300 ${
                        hasSpecial ? "text-green-400" : "text-white/40"
                      }`}>
                        <CircleCheckBig className={`w-4 h-4 transition-transform duration-300 ${
                          hasSpecial ? "text-green-400 scale-100" : "text-white/20 scale-95"
                        }`} />
                        <span>One special character (!@#)</span>
                      </div>
                    </div>
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
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 mt-1.5 text-xs transition-colors duration-300 ${
                    formData.password === formData.confirmPassword ? "text-green-400" : "text-white/40"
                  }`}>
                    <CircleCheckBig className={`w-4 h-4 transition-transform duration-300 ${
                      formData.password === formData.confirmPassword ? "text-green-400 scale-100" : "text-white/20 scale-95"
                    }`} />
                    <span>Passwords match</span>
                  </div>
                )}
                {errors.confirmPassword && (
                  <p
                    id="confirmPassword-error"
                    role="alert"
                    className="text-xs text-red-400 flex items-center gap-1 mt-1.5"
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
                href="/signin"
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