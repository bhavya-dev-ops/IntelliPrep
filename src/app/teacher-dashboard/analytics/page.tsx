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

export default function StudentAnalyticsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchStudents() {
      // Trying name first, falling back if it fails
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (!error && data) {
        // DEDUPLICATION LOGIC: Ensure each student (by username) only appears once
        const uniqueMap = new Map();
        data.forEach(item => {
          const key = item.leetcode_username || item.github_username || item.name || item.id;
          // If we already have this user, only replace if this record is newer
          if (!uniqueMap.has(key) || new Date(item.updated_at) > new Date(uniqueMap.get(key).updated_at)) {
            uniqueMap.set(key, item);
          }
        });

        const uniqueStudents = Array.from(uniqueMap.values());

        // Client-side sort
        const sorted = uniqueStudents.sort((a, b) => 
          (a.name || a.full_name || '').localeCompare(b.name || b.full_name || '')
        );
        setStudents(sorted);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Student Intelligence Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl overflow-hidden relative">
          <CardBody className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><Users size={20}/></div>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Total Students</h3>
            </div>
            <p className="text-5xl font-black">{students.length}</p>
            <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={80}/></div>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
             <LayoutDashboard className="text-emerald-600" /> Student Progress Hub
          </h2>
          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase">Live Sync Active</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SDE-1 Readiness</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">LeetCode</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GitHub</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                          {(student.name || student.full_name || student.leetcode_username)?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">
                            {student.name || student.full_name || student.leetcode_username}
                          </p>
                          <p className="text-slate-400 text-[10px] font-medium tracking-wide uppercase">
                            {student.leetcode_username ? `@${student.leetcode_username}` : `ID: ${student.id.slice(0, 8)}`}
                          </p>
                        </div>
                      </div>
                    </td>
                  <td className="px-8 py-6">
                    <div className="w-full max-w-[200px]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-slate-700">{student.sde_readiness}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                          style={{ width: `${student.sde_readiness}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="font-black text-slate-900">{student.leetcode_solved || 0}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="font-black text-slate-900">{student.github_repos || 0}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
