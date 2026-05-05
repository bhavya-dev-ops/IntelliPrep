"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  User, Mail, GitBranch, Globe, MapPin, 
  Save, Shield, Zap, Award, Edit3,
  CheckCircle2, AlertCircle, Loader2, ArrowLeft,
  Briefcase, GraduationCap, Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const { userData, user, loading: authLoading, refreshUserData } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    leetcode_username: '',
    github_username: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setProfile(data);
          setFormData({
            name: userData?.name || '',
            city: data.city || '',
            leetcode_username: data.leetcode_username || '',
            github_username: data.github_username || '',
          });
        } else {
          // If no profile exists, initialize with userData
          setFormData(prev => ({
            ...prev,
            name: userData?.name || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchProfile();
    }
  }, [user, authLoading, userData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update users table (name)
      const { error: userError } = await supabase
        .from('users')
        .update({ name: formData.name })
        .eq('id', user?.id);

      if (userError) throw userError;

      // 2. Update profiles table (extended info)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          city: formData.city,
          leetcode_username: formData.leetcode_username,
          github_username: formData.github_username,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      await refreshUserData();
      setMessage({ type: 'success', text: 'Identity synchronized successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setMessage({ type: 'error', text: err.message || 'Synchronization failed' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Identity Vault...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-800 mb-8 border border-white/5">
          <Shield size={40} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Protocol Violation</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs max-w-xs leading-relaxed">Secure authentication is required to modify your professional record.</p>
        <Link href="/login">
          <Button className="mt-10 px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)]">Initialize Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 selection:text-blue-200 font-sans">
      {/* ENTERPRISE HUD NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-3xl border-b border-white/5 py-6 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                <ArrowLeft size={20} />
             </Link>
             <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
             <div>
                <h2 className="font-black text-lg tracking-tight leading-none uppercase">Identity <span className="text-blue-500">Node</span></h2>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Ref: {user.id.substring(0, 8)}...{user.id.substring(user.id.length - 4)}</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Biometric Encrypted</span>
            </div>
            <Link href={userData?.role === 'teacher' ? "/teacher-dashboard" : "/dashboard"}>
               <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 text-slate-300 font-black uppercase tracking-widest text-[9px] px-6">
                  Exit to Terminal
               </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* PROFILE CARD & QUICK STATS */}
          <aside className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-10 bg-slate-900/50 rounded-[3rem] border border-white/5 backdrop-blur-xl relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all duration-700"></div>
               
               <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative group cursor-pointer">
                    <div className="w-28 h-28 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-700 border border-white/5 group-hover:border-blue-500/50 transition-all duration-700 shadow-2xl">
                       <User size={48} className="group-hover:scale-110 group-hover:text-blue-400 transition-all duration-700" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2.5 rounded-2xl border-4 border-slate-950 text-white shadow-xl group-hover:scale-110 transition-transform">
                       <Edit3 size={14} />
                    </div>
                  </div>
                  
                  <h3 className="mt-8 text-2xl font-black tracking-tighter">{formData.name || 'Anonymous User'}</h3>
                  <div className="mt-3 flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                     <Shield size={12} className="text-blue-500" />
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{userData?.role || 'Developer'} Identity</span>
                  </div>
               </div>

               <div className="mt-12 space-y-3">
                  {[
                    { label: 'Profile Config', icon: User, active: true },
                    { label: 'Platform Sync', icon: Zap },
                    { label: 'Global Visibility', icon: Globe },
                    { label: 'Security Protocols', icon: Shield }
                  ].map((item, i) => (
                    <button 
                      key={i}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest group ${
                        item.active 
                        ? 'bg-blue-500 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)]' 
                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={16} className={item.active ? 'text-white' : 'group-hover:text-blue-400'} />
                        {item.label}
                      </div>
                      {item.active && <CheckCircle2 size={14} />}
                    </button>
                  ))}
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] shadow-2xl shadow-blue-900/30 relative overflow-hidden"
            >
               <div className="absolute -bottom-8 -right-8 opacity-10">
                  <Award size={160} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/10 rounded-xl"><Zap className="text-white" size={16} /></div>
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">SDE-1 READINESS CORE</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-6xl font-black text-white tracking-tighter leading-none">{profile?.sde_readiness || 0}</h2>
                    <span className="text-2xl font-black text-white/50">%</span>
                  </div>
                  <div className="w-full bg-black/20 h-2 rounded-full mt-8 overflow-hidden backdrop-blur-md">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profile?.sde_readiness || 0}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="bg-white h-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                    />
                  </div>
                  <p className="mt-8 text-[10px] text-white/70 leading-relaxed font-bold uppercase tracking-wide">
                    AI engine calculates this score based on your platform activity and profile completeness.
                  </p>
               </div>
            </motion.div>
          </aside>

          {/* EDIT FORM CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-6 rounded-[2rem] border flex items-center justify-between shadow-xl ${
                    message.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <span className="text-sm font-black tracking-tight uppercase tracking-wider">{message.text}</span>
                  </div>
                  <button onClick={() => setMessage(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-50 hover:opacity-100">
                    <Layout size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/40 border-white/5 rounded-[3.5rem] overflow-hidden backdrop-blur-md">
                <CardBody className="p-12">
                  <form onSubmit={handleSave} className="space-y-12">
                    {/* SECTION: BASIC INFO */}
                    <section>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                           <User size={20} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black tracking-tight leading-none uppercase">Basic Professional Info</h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Core identity parameters</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-all" size={18} />
                            <input 
                              type="text" 
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                              placeholder="e.g. Bhavyansh Garg"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Base (City)</label>
                          <div className="relative group">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-all" size={18} />
                            <input 
                              type="text" 
                              value={formData.city}
                              onChange={(e) => setFormData({...formData, city: e.target.value})}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                              placeholder="e.g. San Francisco, CA"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* SECTION: INTEGRATIONS */}
                    <section>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                           <Zap size={20} />
                        </div>
                        <div>
                           <h4 className="text-lg font-black tracking-tight leading-none uppercase">Platform Synchronization</h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-platform engineering data</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-slate-400">GitHub ID</label>
                          <div className="relative group">
                            <GitBranch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-all" size={18} />
                            <input 
                              type="text" 
                              value={formData.github_username}
                              onChange={(e) => setFormData({...formData, github_username: e.target.value})}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all placeholder:text-slate-700"
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-slate-400">LeetCode ID</label>
                          <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md border border-slate-600 flex items-center justify-center text-[9px] font-black group-focus-within:border-amber-500 group-focus-within:text-amber-500 transition-all">LC</div>
                            <input 
                              type="text" 
                              value={formData.leetcode_username}
                              onChange={(e) => setFormData({...formData, leetcode_username: e.target.value})}
                              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-slate-700"
                              placeholder="username"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-[10px] text-blue-400 font-bold leading-relaxed flex items-start gap-3">
                           <AlertCircle size={14} className="shrink-0 mt-0.5" />
                           Platform IDs are used to fetch your latest solved problems and repository statistics. Ensure these are public for synchronization to function.
                        </p>
                      </div>
                    </section>

                    {/* FORM FOOTER */}
                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Updated</span>
                            <span className="text-xs font-bold text-slate-300">{profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'Never'}</span>
                         </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={saving}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs px-12 py-5 rounded-2xl shadow-[0_15px_30px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                      >
                        {saving ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Syncing Identity...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 group-hover:gap-5 transition-all">
                            <Save size={16} />
                            Save Configuration
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </motion.div>

            {/* EXTERNAL LINKS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
               <Link href={`/profile/${formData.leetcode_username || user.id}`} className="block group">
                 <div className="p-8 bg-slate-900/20 rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center group-hover:bg-slate-900/50 group-hover:border-blue-500/30 transition-all h-full">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-slate-500 mb-6 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
                      <Globe size={24} />
                    </div>
                    <h5 className="font-black text-base mb-2 tracking-tight">Public Professional Profile</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-400 transition-colors">Preview your external identity node</p>
                 </div>
               </Link>
               <Link href="/dashboard/leetcode" className="block group">
                 <div className="p-8 bg-slate-900/20 rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center group-hover:bg-slate-900/50 group-hover:border-amber-500/30 transition-all h-full">
                    <div className="w-14 h-14 rounded-[1.5rem] bg-slate-800 flex items-center justify-center text-slate-500 mb-6 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-all">
                      <Zap size={24} />
                    </div>
                    <h5 className="font-black text-base mb-2 tracking-tight">Achievement Terminal</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-400 transition-colors">Manual synchronization & analytics</p>
                 </div>
               </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-24 border-t border-white/5 text-center">
        <div className="max-w-6xl mx-auto px-8 flex flex-col items-center">
           <div className="w-10 h-1 w-1 bg-white/5 rounded-full mb-12"></div>
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.6em]">Proprietary Identity Management Engine • IntelliPrep Nexus v4.0</p>
           <p className="text-slate-800 text-[8px] font-black uppercase tracking-widest mt-4">System Status: Nominal • Session Encryption: Active</p>
        </div>
      </footer>
    </div>
  );
}
