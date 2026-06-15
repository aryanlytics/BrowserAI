"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mic, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'; // ✅ App Router — NOT 'next/router'

// ─── Protected Navbar ─────────────────────────────────────────────────────────
// Shown only on dashboard routes. Handles logout.
// cookies() is a Server-only API — this component only calls the logout API
// endpoint; the browser automatically forwards the httpOnly sessionToken cookie
// via withCredentials (set in lib/api.ts). No manual cookie reading needed here.

const Navbar = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // prevent double-click
    setIsLoggingOut(true);

    try {
      // The browser sends the sessionToken cookie automatically because
      // api.ts sets withCredentials: true — no manual Cookie header needed.
      await api.post('/api/auth/logout');

      toast.success('Logged out successfully');
      router.push('/signin');
      router.refresh(); // clear any cached server component data
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message =
        axiosError.response?.data?.message ?? 'Something went wrong. Please try again.';
      toast.error('Logout failed', { description: message });
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="w-full sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 flex items-center justify-center">
          <Mic className="w-5 h-5 text-blue-400" />
        </div>
        <Link className="font-extrabold text-2xl tracking-tight text-white" href="/">
          Browser<span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500">AI</span>
        </Link>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <Link className="hover:text-white transition-colors duration-200" href="/">Product</Link>
        <Link className="hover:text-white transition-colors duration-200" href="/use-cases">Use Cases</Link>
        <Link className="hover:text-white transition-colors duration-200" href="/pricing">Pricing</Link>
        <Link className="hover:text-white transition-colors duration-200" href="/resources">Resources</Link>
      </div>

      {/* Logout */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-white text-black hover:bg-white/90 rounded-full px-6 gap-2 disabled:opacity-70"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Logging out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              Logout
            </>
          )}
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;