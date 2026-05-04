"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActiveTimeTracker } from '@/components/layout/ActiveTimeTracker';
import { Footer } from '@/components/layout/Footer';
import IntiChat from '@/components/ai/IntiChat';
import { Share2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // Using ID is 100% reliable as it matches the primary key in Supabase
    const shareId = userData?.id || user?.id;
    
    if (!shareId) {
      alert('Authentication error. Please refresh.');
      return;
    }

    const url = `${window.location.origin}/profile/${shareId}`;
    
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ActiveTimeTracker />
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col transition-all duration-300">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all active:scale-95 group shadow-sm"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} className="group-hover:rotate-12 transition-transform" />}
              {copied ? 'Copied!' : 'Share Profile'}
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {userData?.name?.[0] || 'U'}
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 p-6 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      <IntiChat />
    </div>
  );
}
