import React from 'react';
import Image from 'next/image';
import { Mic, Sparkles, Command, ArrowRight, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-8 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>The next generation of web interaction</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl">
            Speak your intent. <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-indigo-400 to-purple-500">
              Browser executes.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl leading-relaxed">
            Experience the internet at the speed of thought. Control your browser, automate complex workflows, and extract data using natural voice commands.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg w-full sm:w-auto group">
              <Mic className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Automating Free
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-white/20 text-white hover:bg-white/5 w-full sm:w-auto group">
              See How It Works
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Hero Image / "Soul Touch" Visual */}
          <div className="w-full max-w-5xl relative">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full bg-linear-to-t from-[#0a0a0f] via-transparent to-transparent z-10 pointer-events-none"></div>
              <Image 
                src="/hero-realistic.png" 
                alt="Browser AI Interface" 
                width={1200} 
                height={675}
                className="w-full h-auto object-cover transform scale-[1.01]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8 relative border-t border-white/5 bg-[#08080c]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How BrowserAI Feels</h2>
            <p className="text-white/60 max-w-2xl mx-auto">A seamless connection between your thoughts and the web. No more clicking, scrolling, or navigating complex UI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1. You Speak</h3>
              <p className="text-white/60 leading-relaxed">
                &quot;Find me flights to Tokyo next weekend under $800.&quot; Just talk normally, as if you were speaking to a human assistant.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px]"></div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">2. AI Understands</h3>
              <p className="text-white/60 leading-relaxed">
                Our advanced language model breaks down your intent, understanding context, constraints, and the exact steps required.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Command className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">3. Browser Acts</h3>
              <p className="text-white/60 leading-relaxed">
                Watch as the browser magically navigates sites, fills out forms, compares prices, and presents the results instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "Soul Touch" Quote Section */}
      <section className="py-32 px-8 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-600/5 backdrop-blur-[100px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Mic className="w-12 h-12 text-white/20 mx-auto mb-8" />
          <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight mb-8">
            &quot;It feels less like using a tool, and more like having an extension of my own mind interacting with the web.&quot;
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-400 to-purple-600"></div>
            <div className="text-left">
              <p className="font-semibold text-white">Alex Chen</p>
              <p className="text-white/60 text-sm">Early Adopter</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}