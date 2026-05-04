"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Users, Target, Zap, AlertCircle, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgScore: 0,
    atRisk: 0,
    totalSyncs: 0
  });
  const [distribution, setDistribution] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchDashboardData = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    
    if (!error && data) {
      // 1. Calculate Stats
      const total = data.length;
      const avg = total > 0 ? Math.round(data.reduce((acc, curr) => acc + (curr.sde_readiness || 0), 0) / total) : 0;
      const riskList = data.filter(s => (s.sde_readiness || 0) < 30);
      
      setStats({
        totalStudents: total,
        avgScore: avg,
        atRisk: riskList.length,
        totalSyncs: data.reduce((acc, curr) => acc + (curr.leetcode_solved || 0), 0)
      });

      // 2. Performance Distribution
      setDistribution([
        { name: 'Low (0-30%)', count: riskList.length, color: '#f43f5e' },
        { name: 'Mid (30-70%)', count: data.filter(s => s.sde_readiness >= 30 && s.sde_readiness < 70).length, color: '#3b82f6' },
        { name: 'High (70%+)', count: data.filter(s => s.sde_readiness >= 70).length, color: '#10b981' },
      ]);

      setAtRiskStudents(riskList.slice(0, 5));
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('teacher-main-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!mounted || loading) return (
    <div className="p-12 text-center flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Class Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Teacher Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Real-time class oversight & student metrics.</p>
      </header>

      {/* LIVE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Users size={18}/></div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Students</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{stats.totalStudents}</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-2">Verified Profiles</p>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Target size={18}/></div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Avg. Score</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{stats.avgScore}%</p>
            <p className="text-[10px] font-bold text-emerald-500 mt-2">Class Readiness</p>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><AlertCircle size={18}/></div>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Red Zone</h3>
            </div>
            <p className="text-4xl font-black text-rose-600">{stats.atRisk}</p>
            <p className="text-[10px] font-bold text-rose-400 mt-2">Needs Intervention</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl text-white"><Zap size={18}/></div>
              <h3 className="text-[10px] font-black uppercase text-white/60 tracking-widest">Total Solves</h3>
            </div>
            <p className="text-4xl font-black text-white">{stats.totalSyncs}</p>
            <p className="text-[10px] font-bold text-blue-400 mt-2">Class Power</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
             <h2 className="text-xl font-black text-slate-900">Class Performance Overview</h2>
          </CardHeader>
          <CardBody className="p-8">
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60}>
                         {distribution.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </CardBody>
        </Card>

        {/* NEEDS ATTENTION SECTION */}
        <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-100">
             <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-rose-500" /> Critical Audit
             </h2>
          </CardHeader>
          <CardBody className="p-0">
             <ul className="divide-y divide-slate-50">
                {atRiskStudents.map((student, i) => (
                   <li key={i} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                            {(student.name || student.leetcode_username)?.[0]?.toUpperCase()}
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-sm">{student.name || student.leetcode_username}</p>
                            <p className="text-[10px] font-bold text-rose-400 uppercase">Readiness: {student.sde_readiness}%</p>
                         </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                   </li>
                ))}
                {atRiskStudents.length === 0 && (
                   <div className="p-12 text-center">
                      <TrendingUp className="mx-auto mb-4 text-emerald-500" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Class is Healthy</p>
                   </div>
                )}
             </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
