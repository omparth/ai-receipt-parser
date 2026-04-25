'use client';

import { useState } from 'react';
import { ReceiptUploader } from '@/components/receipt-uploader';
import { ReceiptList } from '@/components/receipt-list';
import { ReceiptText, UploadCloud, History, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [uploadTrigger, setUploadTrigger] = useState(0);

  const handleUploadSuccess = (result: any) => {
    setUploadTrigger((prev) => prev + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100">
      {/* 1. Subtle Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />

      {/* 2. Top Progress/Accent Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent z-50 opacity-50" />

      <div className="container relative mx-auto px-6 py-16 max-w-6xl">
        {/* --- Hero Header Section --- */}
        <header className="mb-16 space-y-4">
          <div className="flex flex-wrap items-center gap-3 mb-6 justify-center md:justify-start">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <Zap className="w-3 h-3 mr-1.5 fill-current" />
              v2.0 Turbo
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
              <ShieldCheck className="w-3 h-3 mr-1.5" />
              Secure OCR
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-center md:text-left leading-[1.1]">
            Automate your <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Receipt Workflows
            </span>
          </h1>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl text-center md:text-left leading-relaxed">
            Extracting data shouldn't be manual. Our AI scans <span className="text-slate-900 dark:text-white font-medium italic underline decoration-blue-500/30">every detail</span> from your receipts in seconds.
          </p>
        </header>

        {/* --- Main Dashboard Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Uploader */}
          <section className="lg:col-span-5 space-y-6">
            <div className="group relative">
              {/* Outer Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-800 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Drop & Scan</h2>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Process New</p>
                    </div>
                  </div>
                  <Sparkles className="w-5 h-5 text-blue-500 animate-bounce" />
                </div>
                
                <div className="relative">
                   <ReceiptUploader onSuccess={handleUploadSuccess} />
                </div>

                <div className="mt-8 flex items-center justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                   <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                   <span className="text-[10px] font-bold text-slate-400">NEXT-GEN AI READY</span>
                   <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: List */}
          <section className="lg:col-span-7">
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-slate-800/60 rounded-[2rem] overflow-hidden flex flex-col h-full shadow-sm">
              <div className="flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold`}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Recent History</h2>
                </div>
                
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SYNCED</span>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto max-h-[600px] scrollbar-hide">
                <ReceiptList refreshTrigger={uploadTrigger} />
              </div>
            </div>
          </section>
        </div>

        {/* --- Footer --- */}
        <footer className="mt-20 py-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                <ReceiptText className="w-5 h-5 text-white dark:text-black" />
             </div>
             <span className="font-bold tracking-tight text-lg italic">RE.</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">
            © 2026 AI Receipt Intelligence. Built for high-performance finance teams.
          </p>
        </footer>
      </div>
    </main>
  );
}