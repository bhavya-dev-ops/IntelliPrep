"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { Award, Zap, Globe, Code, Clock, Play, FileText } from 'lucide-react';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEverything() {
      try {
        // 1. SMART SEARCH: Case-Insensitive matching for handles and name
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`leetcode_username.ilike.${username},github_username.ilike.${username},name.ilike.${username}`)
          .maybeSingle();

        if (!data) {
          const { data: idData } = await supabase.from('profiles').select('*').eq('id', username).maybeSingle();
          data = idData;
        }
        
        if (data) {
          setProfile(data);
          // 2. FETCH WEATHER (Ambient Context)
          const city = data.city || 'New Delhi';
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true`);
          const weatherData = await weatherRes.json();
          setWeather(weatherData.current_weather);
        }
      } catch (err) {
        console.error('Master Fetch Failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEverything();
  }, [username]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-blue-500 animate-pulse font-black tracking-widest uppercase text-xs">Initializing Secure Profile...</div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">404</h1>
      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Developer Identity Not Found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 selection:bg-blue-500 selection:text-white">
      {/* ENTERPRISE WATERMARK NAV */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic text-xs shadow-[0_0_15px_rgba(37,99,235,0.4)]">IP</div>
             <span className="font-black text-lg tracking-tight">IntelliPrep <span className="text-blue-500">Verified Identity</span></span>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Clock size={12} className="text-blue-500" /> Last Synced: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Just Now'}
             </div>
             <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-400/20">
                <Award size={12} /> SDE-1 Certified
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12 space-y-10">
        {/* HERO SECTION */}
        <header className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-slate-900 p-12 rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
              <div className="relative z-10 text-center md:text-left">
              <h1 className="text-7xl font-black tracking-tighter mb-4 capitalize">
                {profile.name || (profile.leetcode_username ? `@${profile.leetcode_username}` : 'IntelliPrep Developer')}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold text-sm">
                 <span className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Full-Stack Architect</span>
                 <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                 <span className="flex items-center gap-2 text-blue-400"><Clock size={14} /> Today's Focus: {formatTime(profile.study_time_seconds || 0)}</span>
              </div>
           </div>
           </div>

           <div className="bg-blue-600 p-10 rounded-[3rem] shadow-2xl shadow-blue-600/20 flex flex-col items-center justify-center text-center group">
              <p className="text-blue-100 text-[10px] font-black uppercase mb-4 tracking-widest opacity-80">Interview Readiness</p>
              <div className="relative">
                 <h2 className="text-7xl font-black text-white mb-2 tracking-tighter">{profile.sde_readiness}%</h2>
                 <div className="absolute -top-2 -right-4 bg-white text-blue-600 px-2 py-1 rounded-lg font-black text-[8px] uppercase">AI Verified</div>
              </div>
              <div className="w-full bg-blue-700 h-2 rounded-full mt-6 overflow-hidden">
                 <div className="bg-white h-full transition-all duration-1000" style={{ width: `${profile.sde_readiness}%` }}></div>
              </div>
           </div>
        </header>

        {/* TECH DNA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <Card className="lg:col-span-2 border-none bg-slate-900 shadow-xl rounded-[2.5rem] overflow-hidden border border-white/5">
              <CardBody className="p-10">
                 <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black">Algorithmic Skill DNA</h3>
                    <div className="p-4 bg-white/5 rounded-2xl text-amber-500"><Code size={24} /></div>
                 </div>
                 <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: 'Arrays', A: 85 }, { subject: 'Graphs', A: 65 },
                        { subject: 'Strings', A: 75 }, { subject: 'DP', A: 45 }, { subject: 'Math', A: 90 }
                      ]}>
                        <PolarGrid stroke="#1e293b" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </CardBody>
           </Card>

            <div className="space-y-8">
              <Card className="bg-slate-900 border-none rounded-[2.5rem] border border-white/5">
                 <CardBody className="p-8">
                    <p className="text-slate-500 font-black uppercase text-[10px] mb-6 tracking-widest">Platform Sync</p>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="flex items-center gap-3 text-sm font-bold"><div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">LC</div> LeetCode Solved</span>
                          <span className="text-xl font-black">{profile.leetcode_solved || 0}</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="flex items-center gap-3 text-sm font-bold"><div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">GH</div> GitHub Repos</span>
                          <span className="text-xl font-black">{profile.github_repos || 0}</span>
                       </div>
                    </div>
                 </CardBody>
              </Card>

              {/* LEARNING JOURNEY SECTION */}
              <div className="space-y-6">
                 <div className="flex items-center gap-3 px-4">
                    <Zap size={16} className="text-blue-500" />
                    <h3 className="text-lg font-black tracking-tight">Learning Journey</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                      // Shimmer Effect
                      <>
                        {[1, 2].map((i) => (
                          <div key={i} className="h-32 bg-slate-800/50 rounded-[2rem] animate-pulse border border-white/5"></div>
                        ))}
                      </>
                    ) : (
                      <>
                        <Card className="bg-slate-900 border-none rounded-[2rem] border border-white/5 hover:bg-slate-800/50 transition-colors">
                           <CardBody className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                 <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
                                    <Play size={20} />
                                 </div>
                                 <span className="text-2xl font-black">{profile.videos_watched_count || 0}</span>
                              </div>
                              <h4 className="font-bold text-sm">Academic Progress</h4>
                              <p className="text-slate-500 text-[10px] mt-1">Verified Educational Videos</p>
                              <div className="mt-4 pt-4 border-t border-white/5">
                                 <p className="text-[9px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Award size={10} /> Watch-time verified via Firewall
                                 </p>
                              </div>
                           </CardBody>
                        </Card>

                        <Card className="bg-slate-900 border-none rounded-[2rem] border border-white/5 hover:bg-slate-800/50 transition-colors">
                           <CardBody className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                 <div className="p-3 bg-emerald-600/10 rounded-xl text-emerald-500">
                                    <FileText size={20} />
                                 </div>
                                 <span className="text-2xl font-black">{profile.notes_count || 0}</span>
                              </div>
                              <h4 className="font-bold text-sm">Knowledge Repository</h4>
                              <p className="text-slate-500 text-[10px] mt-1">Technical Notes Prepared</p>
                              <div className="mt-4 flex items-center">
                                 <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-1 rounded border border-emerald-500/20">
                                    Structured Technical Documentation
                                 </span>
                              </div>
                           </CardBody>
                        </Card>
                      </>
                    )}
                 </div>
              </div>

              <Card className="bg-slate-900 border-none rounded-[2.5rem] border border-white/5">
                 <CardBody className="p-8">
                    <p className="text-slate-500 font-black uppercase text-[10px] mb-4 tracking-widest">Featured Projects</p>
                    <div className="space-y-4">
                       {profile.github_stats?.topRepos?.slice(0, 2).map((repo: any, i: number) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <h4 className="font-black text-sm mb-1">{repo.name}</h4>
                             <p className="text-slate-500 text-[10px] line-clamp-1">{repo.description}</p>
                          </div>
                       ))}
                    </div>
                 </CardBody>
              </Card>
           </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 text-center">
         <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Proprietary AI Verified Professional Identity</p>
      </footer>
    </div>
  );
}
