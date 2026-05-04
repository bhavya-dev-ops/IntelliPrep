"use client";

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { Footer } from '@/components/layout/Footer';

function Counter({ value, direction = "up", suffix = "" }: { value: number, direction?: "up" | "down", suffix?: string }) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: 2000,
  });

  const displayValue = useTransform(springValue, (current) => 
    Math.floor(current).toLocaleString() + suffix
  );

  React.useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  return <motion.span ref={ref}>{displayValue}</motion.span>;
}

export default function LandingPage() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col pt-20">
        {/* HERO SECTION */}
        <section className="relative py-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[10%] w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse"></div>
          </div>

          <div className="max-w-4xl w-full z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary font-bold text-sm tracking-wide shadow-sm animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
              The Next-Gen SDE-1 Recruitment Standard
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1]">
              Build <span className="text-primary">Smarter.</span><br />
              Get <span className="text-secondary">Placed</span> Better.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              IntelliPrep is an AI-driven Placement Analytics engine that syncs your LeetCode logic and GitHub implementation into a single, verified SDE-1 Readiness profile.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href={session ? "/dashboard" : "/signup"}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-xl px-10 py-4 shadow-2xl shadow-primary/30 transform transition hover:-translate-y-1 hover:scale-105 active:scale-95 font-bold">
                  {session ? "Analyze My Readiness" : "Get Verified Now"}
                </Button>
              </Link>
              {!session && (
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-xl px-10 py-4 border-2 hover:bg-gray-50 transition-all font-bold">
                    Login to Account
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Floating Feature Preview */}
          <div className="mt-24 w-full max-w-6xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden aspect-[16/9] md:aspect-[21/9]">
               <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white p-8 flex flex-col justify-center items-center">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full h-full items-center">
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transform transition hover:scale-105">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-slate-900">Placement Sprint Tracking</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">Monitor your focus minutes and coding sessions with second-by-second analytics tailored for SDE-1 preparation.</p>
                    </div>
                    <div className="p-6 bg-primary text-white rounded-2xl shadow-xl transform transition hover:scale-110 z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-white">Consistency Analytics</h3>
                      <p className="text-white/80 text-sm leading-relaxed">Prove your discipline to recruiters with a GitHub-style heatmap that tracks your daily growth across LeetCode and Development.</p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transform transition hover:scale-105">
                      <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                      </div>
                      <h3 className="font-bold text-xl mb-2 text-slate-900">Skill Repository</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">A centralized hub for your DSA notes, system design materials, and roadmap—everything you need to crack top product companies.</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION WITH COUNT-UP */}
        <section className="py-24 border-t border-gray-100 bg-gray-50/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              <div>
                <p className="text-5xl font-black text-primary mb-2 tracking-tighter">
                  <Counter value={99} suffix="%" />
                </p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Consistency Boost</p>
              </div>
              <div>
                <p className="text-5xl font-black text-secondary mb-2 tracking-tighter">
                  <Counter value={10} suffix="k+" />
                </p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Problems Solved</p>
              </div>
              <div>
                <p className="text-5xl font-black text-primary mb-2 tracking-tighter">
                  <Counter value={500} suffix="k+" />
                </p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Commits Tracked</p>
              </div>
              <div>
                <p className="text-5xl font-black text-secondary mb-2 tracking-tighter">
                  <Counter value={24} suffix="/7" />
                </p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Placement Readiness</p>
              </div>
            </div>
          </div>
        </section>

        {/* CAREER TRANSFORMATION CTA */}
        <section className="py-24 px-6 pb-40">
           <div className="max-w-5xl mx-auto bg-slate-950 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl border border-white/5">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[120px]"></div>
              
              <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter relative z-10 leading-none">
                Ready to transform your <span className="text-primary italic">career path?</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
                Join thousands of developers who are using IntelliPrep to build verified profiles and crack their dream placements faster.
              </p>
              
              <Link href="/signup" className="relative z-10 inline-block group">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="px-16 py-6 text-2xl font-black bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] rounded-2xl transform active:scale-95 animate-pulse-subtle"
                >
                  Analyze My Readiness
                </Button>
              </Link>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
