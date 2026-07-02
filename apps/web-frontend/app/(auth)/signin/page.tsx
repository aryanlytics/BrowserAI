"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import { toast } from 'sonner';
import {loginSchema} from '@browser-ai/validators/zod/auth';



const SignIn = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleinput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlepassword = () => {
    router.push('/forgetpassword');
  };
    
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const result = loginSchema.safeParse(formData);
    
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        formattedErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    const toastId = toast.loading("Signing you in...");

    try {
      await api.post('/api/auth/signin', {
        email: formData.email,
        password: formData.password,
      });

      toast.success("Signed in successfully!", { id: toastId });
      router.push('/dashboard');

    } catch (err) {
    // ── Fix 2: use axios isAxiosError instead of manual cast ────────────
      if (axios.isAxiosError(err)) {
        const status  = err.response?.status
        const message = err.response?.data?.message

        // ── Fix 3: check status code, not a code field that doesn't exist ─
        if (status === 403) {
          toast.error('Email not verified', {
            id:          toastId,
            description: message || 'Please verify your email before signing in.',
          })
          router.push(`/verifyotp?email=${encodeURIComponent(formData.email)}`)
          return
        }

        toast.error('Signin failed', {
          id:          toastId,
          description: message || 'Invalid email or password.',
        })
      } else {
        toast.error('Unexpected error', {
          id:          toastId,
          description: 'Something went wrong. Please try again.',
        })
      }
  } finally {
    setIsLoading(false)
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
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-white/60">
              Enter your email and password to sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <Label htmlFor="email" className={errors.email ? "text-red-400" : ""}>Email</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.email ? "text-red-400" : "text-white/40"}`} />
                  <Input 
                    autoComplete="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleinput} 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    className={`bg-white/5 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-500 ${errors.email ? "border-red-500/50 focus-visible:ring-red-500" : "border-white/10"}`} 
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className={errors.password ? "text-red-400" : ""}>Password</Label>
                  <Button onClick={handlepassword} className="text-xs text-blue-400 hover:text-blue-300">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.password ? "text-red-400" : "text-white/40"}`} />
                  <Input 
                    name="password"
                    value={formData.password}
                    onChange={handleinput}
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password"
                    autoComplete="current-password"
                    className={`bg-white/5 text-white pl-10 pr-10 focus-visible:ring-blue-500 ${errors.password ? "border-red-500/50 focus-visible:ring-red-500" : "border-white/10"}`} 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0f16] px-2 text-white/60">Or continue with</span>
              </div>
            </div>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => toast.info("Google sign-in is not available right now.", { description: "Please register/login using email." })}
              className="w-full border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Google
            </Button>
            <p className="mt-4 text-center text-sm text-white/60">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;