"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ActiveTimeTracker } from '@/components/layout/ActiveTimeTracker';
import { Footer } from '@/components/layout/Footer';
import IntiChat from '@/components/ai/IntiChat';
import { Share2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { NotificationsMenu } from '@/components/layout/NotificationsMenu';

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

            <NotificationsMenu />
            <Link 
              href="/profile" 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black shadow-lg hover:scale-110 transition-all border-2 border-white cursor-pointer group relative"
              title="View Profile Node"
            >
              {userData?.name?.[0] || 'U'}
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </Link>
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
