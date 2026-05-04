"use client";

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-20 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[120px]"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16 text-left">
          
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-white text-2xl font-black mb-1">
              Intelli<span className="text-primary">Prep</span>
            </h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Your Verified Path to SDE-1</p>
            <p className="text-sm leading-relaxed text-slate-500 font-medium">
              Empowering developers with AI-driven placement analytics to build verified profiles and accelerate their SDE-1 career journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Placement Hub</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2 text-slate-400">Placement Sync <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">LIVE</span></Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors text-slate-400">SDE-1 Roadmap</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors text-slate-400">Verified Profiles</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Platform</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#" className="hover:text-white transition-colors text-slate-400">Recruiter Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-slate-400">Privacy Shield</a></li>
              <li><a href="#" className="hover:text-white transition-colors text-slate-400">Terms of Growth</a></li>
            </ul>
          </div>

          {/* Newsletter/Action */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Stay Certified</h3>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="bg-transparent rounded-lg px-4 py-2 text-xs w-full focus:outline-none text-white"
              />
              <button className="bg-primary text-slate-900 px-4 py-2 rounded-lg text-xs font-black hover:bg-white transition-all">
                Sync
              </button>
            </div>
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-all group">
                <svg className="w-5 h-5 group-hover:text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-all group">
                <svg className="w-5 h-5 group-hover:text-slate-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
            © 2026 IntelliPrep. Built for the Next-Gen SDE.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">X / Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
