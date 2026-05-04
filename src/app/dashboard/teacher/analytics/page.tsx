"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { Users, LayoutDashboard, Database, Trophy } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  leetcode_username: string;
  leetcode_solved: number;
  github_repos: number;
  sde_readiness: number;
}

export default function SimpleTeacherTracker() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      // Fetching all profiles from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setStudents(data);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Connecting to Student Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* 1. TOP SUMMARY SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden relative">
          <CardBody className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400"><Users size={20}/></div>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Total Students</h3>
            </div>
            <p className="text-5xl font-black">{students.length}</p>
            <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={80}/></div>
          </CardBody>
        </Card>
      </div>

      {/* 2. MAIN TRACKER TABLE */}
      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
             <LayoutDashboard className="text-blue-600" /> Student Progress Tracker
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Live Database Sync</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SDE-1 Readiness</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LeetCode Solves</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GitHub Repos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {student.name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{student.name || `@${student.leetcode_username}`}</p>
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tight">Verified ID: {student.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-full max-w-[200px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-slate-700">{student.sde_readiness}%</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Placement Ready</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${student.sde_readiness}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl">
                       <Trophy size={14} className="text-amber-500" />
                       <span className="font-black text-slate-900">{student.leetcode_solved || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                       <Database size={14} className="text-slate-500" />
                       <span className="font-black text-slate-900">{student.github_repos || 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="p-20 text-center">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Students Synced Yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
