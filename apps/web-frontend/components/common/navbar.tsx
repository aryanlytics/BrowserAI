import React from 'react';
import Link from 'next/link';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className='w-full sticky top-0 z-50 flex justify-between items-center px-8 py-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10'>
      <div className='flex items-center gap-3'>
        <div className='bg-blue-600/20 p-2 rounded-full border border-blue-500/30 flex items-center justify-center'>
          <Mic className='w-5 h-5 text-blue-400' />
        </div>
        <Link className='font-extrabold text-2xl tracking-tight text-white' href='/'>
          Browser<span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500'>AI</span>
        </Link>
      </div>
      <div className='hidden md:flex items-center gap-8 text-sm font-medium text-white/70'>
        <Link className='hover:text-white transition-colors duration-200' href="/">Product</Link>
        <Link className='hover:text-white transition-colors duration-200' href="/use-cases">Use Cases</Link>
        <Link className='hover:text-white transition-colors duration-200' href="/pricing">Pricing</Link>
        <Link className='hover:text-white transition-colors duration-200' href="/resources">Resources</Link>
      </div>
      <div className='flex items-center gap-4'>
        <Link href="/sign-in">
          <Button className='bg-white text-black hover:bg-white/90 rounded-full px-6'>
            Sign in
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;