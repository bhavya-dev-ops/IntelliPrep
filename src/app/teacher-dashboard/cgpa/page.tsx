"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { getAllCGPAs, CGPARecord } from '@/lib/cgpa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GraduationCap, Search, TrendingUp, Users, Award } from 'lucide-react';

export default function TeacherCGPAManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [cgpas, setCgpas] = useState<CGPARecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cgpaData, { data: profiles }, { data: usersData }] = await Promise.all([
        getAllCGPAs(),
        supabase.from('profiles').select('*'),
        supabase.from('users').select('id, name')
      ]);

      const mergedStudents = (profiles || []).map(p => {
        const u = usersData?.find(u => u.id === p.id);
        const c = cgpaData.find(c => c.student_id === p.id);
        return {
          ...p,
          real_name: u?.name || p.full_name || p.leetcode_username || 'Unknown',
          cgpa: c?.cgpa || null
        };
      });

      setStudents(mergedStudents);
      setCgpas(cgpaData);

      if (cgpaData.length > 0) {
        const validCgpas = cgpaData.map(c => c.cgpa);
        const avg = validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length;
        
        // Distribution ranges: 0-5, 5-6, 6-7, 7-8, 8-9, 9-10
        const distribution = [
          { name: '0-5', count: validCgpas.filter(v => v < 5).length, color: '#f43f5e' },
          { name: '5-6', count: validCgpas.filter(v => v >= 5 && v < 6).length, color: '#fb923c' },
          { name: '6-7', count: validCgpas.filter(v => v >= 6 && v < 7).length, color: '#facc15' },
          { name: '7-8', count: validCgpas.filter(v => v >= 7 && v < 8).length, color: '#60a5fa' },
          { name: '8-9', count: validCgpas.filter(v => v >= 8 && v < 9).length, color: '#4ade80' },
          { name: '9-10', count: validCgpas.filter(v => v >= 9).length, color: '#22c55e' },
        ];

        setStats({
          average: avg.toFixed(2),
          highest: Math.max(...validCgpas).toFixed(2),
          total: cgpaData.length,
          distribution
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.real_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.leetcode_username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <GraduationCap className="text-indigo-600" /> Student CGPA Management
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Monitor class-wide CGPA trends and individual student performance.</p>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
          <CardBody className="p-6 relative z-10">
            <h3 className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={14}/> Class Average CGPA</h3>
            <p className="text-5xl font-black">{stats?.average || '--'}</p>
          </CardBody>
          <div className="absolute -right-6 -bottom-6 opacity-10">
             <TrendingUp size={120} />
          </div>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Award size={14}/> Highest CGPA</h3>
            <p className="text-5xl font-black text-indigo-600">{stats?.highest || '--'}</p>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Students with CGPA</h3>
            <p className="text-5xl font-black text-slate-900">{stats?.total || 0}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CGPA Distribution Chart */}
        <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
             <h2 className="text-xl font-black text-slate-900">Whole Class CGPA Distribution</h2>
          </CardHeader>
          <CardBody className="p-8">
            {stats?.distribution ? (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                      {stats.distribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                No CGPA data recorded yet
              </div>
            )}
          </CardBody>
        </Card>

        {/* Student List & Search */}
        <div className="flex flex-col gap-6">
          <Card className="bg-white border-none shadow-md rounded-[2rem] overflow-hidden">
             <CardBody className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search student by name..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
             </CardBody>
          </Card>

          <div className="flex-1 overflow-y-auto max-h-[500px] space-y-3 pr-2 custom-scrollbar">
            {filteredStudents.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                    {s.real_name[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.real_name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.leetcode_username || 'Student'}</p>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl font-black text-lg ${s.cgpa ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                  {s.cgpa ? s.cgpa.toFixed(2) : '--'}
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No students found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
