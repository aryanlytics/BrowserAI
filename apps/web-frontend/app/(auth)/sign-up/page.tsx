"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const handleinput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name , value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    })
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
  }
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center text-white/60">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input name="fullName" value={formData.fullName} onChange={handleinput} id="full-name" placeholder="John Doe" autoComplete="off" className="bg-white/5 border-white/10 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input name="email" value={formData.email} onChange={handleinput} id="email" type="email" placeholder="m@example.com" autoComplete="off" className="bg-white/5 border-white/10 text-white pl-10 placeholder:text-white/40 focus-visible:ring-blue-500" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                  name="password"
                  value={formData.password}
                  onChange={handleinput}
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder='Password'
                  autoComplete="new-password"
                  className="bg-white/5 border-white/10 text-white pl-10 pr-10 focus-visible:ring-blue-500" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleinput}
                  id="confirm-password" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder='Confirm Password'
                  autoComplete="new-password"
                  className="bg-white/5 border-white/10 text-white pl-10 pr-10 focus-visible:ring-blue-500" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button type='submit' className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
              Create account
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
            <Button variant="outline" className="w-full border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white">
              Google
            </Button>
            <p className="mt-4 text-center text-sm text-white/60">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;