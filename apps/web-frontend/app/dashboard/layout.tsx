"use client";

// Why "use client" here?
// Server layouts run on every navigation → always hits the backend.
// Client layouts persist in the browser → TanStack Query cache works.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/protected/nav';
import { useSession } from '@/lib/hooks/useSession';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isError } = useSession();

  // If session is invalid (401/403), send to sign-in.
  // This is the client-side guard. Middleware already blocked anyone
  // without a cookie; this catches expired/invalid cookies.
  useEffect(() => {
    if (!isLoading && isError) {
      router.replace('/signin?error=session_expired');
    }
  }, [isLoading, isError, router]);

  // Show a spinner only on the very first load (cache miss).
  // On every subsequent protected-route visit: user is already in cache,
  // isLoading is false, we render immediately.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Redirect in-flight (isError → router.replace running) — show spinner instead of blank
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <header>Welcome, {user.name}</header>
      {children}
    </div>
  );
}
