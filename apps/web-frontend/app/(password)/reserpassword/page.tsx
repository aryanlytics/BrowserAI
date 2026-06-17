"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';
import { toast } from 'sonner';
import { resetPasswordSchema } from '@browser-ai/validators/zod/auth';

const ResetPasswordContent = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get('email') || '';

  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [isLoading, setIsLoading]             = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fieldErrors: Record<string, string> = {};

    if (newPassword !== confirmPassword) {
      fieldErrors.confirmPassword = 'Passwords do not match';
    }

    const result = resetPasswordSchema.safeParse({ email, newPassword });
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    const toastId = toast.loading('Resetting password...');

    try {
      await api.post('/api/auth/resetpassword', { email, newPassword });
      toast.success('Password reset!', { id: toastId, description: 'You can now sign in.' });
      router.push('/signin');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      toast.error('Reset failed', { id: toastId, description: msg || 'Something went wrong.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
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
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
          <CardDescription className="text-white/60 text-sm">
            {email ? <>For <span className="text-white/80 font-medium">{email}</span></> : 'Choose a strong password.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className={`text-sm ${errors.newPassword ? 'text-red-400' : 'text-white/70'}`}>
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                disabled={isLoading}
                className={`bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50 ${errors.newPassword ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.newPassword}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={`text-sm ${errors.confirmPassword ? 'text-red-400' : 'text-white/70'}`}>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                disabled={isLoading}
                className={`bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'}`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold mt-2"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Resetting...</> : 'Reset password'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-6">
          <Link href="/signin" className="text-xs text-white/35 hover:text-white/60 transition-colors">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

const ResetPassword = () => (
  <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
    <ResetPasswordContent />
  </Suspense>
);

export default ResetPassword;
