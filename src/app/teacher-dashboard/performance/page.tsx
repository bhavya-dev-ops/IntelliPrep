"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { TrendingUp, Award, Zap, Code, Database, Target } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function ClassPerformancePage() {
  const [stats, setStats] = useState({
    avgReadiness: 0,
    totalSolved: 0,
    totalRepos: 0,
    totalStudents: 0
  });
  const [distribution, setDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const calculateMetrics = (data: any[]) => {
    const total = data.length;
    if (total === 0) return;

    const avgReadiness = Math.round(data.reduce((acc, curr) => acc + (curr.sde_readiness || 0), 0) / total);
    const totalSolved = data.reduce((acc, curr) => acc + (curr.leetcode_solved || 0), 0);
    const totalRepos = data.reduce((acc, curr) => acc + (curr.github_repos || 0), 0);

    // Distribution calculation
    const dist = [
      { range: '0-30%', count: data.filter(s => s.sde_readiness < 30).length, color: '#f43f5e' },
      { range: '30-70%', count: data.filter(s => s.sde_readiness >= 30 && s.sde_readiness < 70).length, color: '#3b82f6' },
      { range: '70-100%', count: data.filter(s => s.sde_readiness >= 70).length, color: '#10b981' },
    ];

    setStats({ avgReadiness, totalSolved, totalRepos, totalStudents: total });
    setDistribution(dist);
  };

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function init() {
      const { data } = await supabase.from('profiles').select('*');
      if (data) calculateMetrics(data);
      setLoading(false);
      // Small delay to ensure container width is calculated
      setTimeout(() => setIsReady(true), 200);
    }

    init();

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('performance-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        init(); // Refresh metrics on any change
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!mounted || loading) return (
    <div className="p-12 text-center flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Calibrating Class Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="text-emerald-500" /> Live Performance Analytics
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Real-time aggregate data for the entire cohort.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 text-white border-none shadow-xl rounded-3xl overflow-hidden group">
          <CardBody className="p-6">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Target size={12}/> Avg. Readiness</p>
            <h2 className="text-4xl font-black text-emerald-400">{stats.avgReadiness}%</h2>
            <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-400" style={{width: `${stats.avgReadiness}%`}}></div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl border-l-4 border-amber-500">
          <CardBody className="p-6">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Code size={12}/> Total Solves</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.totalSolved}</h2>
            <p className="text-[10px] font-bold text-amber-600 mt-2">Class LeetCode Power</p>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl border-l-4 border-blue-500">
          <CardBody className="p-6">
            <p className="text-slate-400 text-[10px] font-black uppercase mb-3 tracking-widest flex items-center gap-2"><Database size={12}/> Total Repos</p>
            <h2 className="text-4xl font-black text-slate-900">{stats.totalRepos}</h2>
            <p className="text-[10px] font-bold text-blue-600 mt-2">Production Implementations</p>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-50">
           <h3 className="text-xl font-black text-slate-900">Readiness Distribution</h3>
           <p className="text-slate-400 text-xs mt-1">Student counts categorized by SDE-1 Readiness scores.</p>
        </div>
        <CardBody className="p-10">
           <div className="h-[350px] w-full min-w-0">
              {isReady && (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={80}>
                       {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
              )}
           </div>
        </CardBody>
      </Card>
    </div>
  );
}
