"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { WatchedVideos } from '@/components/dashboard/WatchedVideos';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const { userData, liveSeconds } = useAuth();

  const [lcSolved, setLcSolved] = useState<number | null>(null);
  const [ghRepos, setGhRepos] = useState<number | null>(null);
  const [readiness, setReadiness] = useState<number>(0);

  // Re-implementing formatStudyTime directly to avoid missing module errors
  const formatStudyTime = (totalSeconds: number) => {
    if (!totalSeconds) return '00H::00M::00S';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(h)}H::${pad(m)}M::${pad(s)}S`;
  };

  useEffect(() => {
    async function backgroundSync() {
      if (!userData?.id) return;
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('leetcode_solved, github_repos, sde_readiness')
          .eq('id', userData.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') return;
          throw profileError;
        }

        if (profile) {
          setLcSolved(profile.leetcode_solved || 0);
          setGhRepos(profile.github_repos || 0);
          setReadiness(profile.sde_readiness || 0);
        }
      } catch (err) {
        console.warn('Dashboard stats not yet synced:', err);
      }
    }
    backgroundSync();
  }, [userData?.id]);

  const totalStudySeconds = (Number(userData?.study_time_seconds) || 0) + liveSeconds;
  const studyHours = formatStudyTime(totalStudySeconds);

  const stats = [
    { label: 'SDE-1 Readiness', value: `${readiness}%`, change: 'AI Calculated', trend: 'up', color: 'text-blue-600' },
    { label: 'LeetCode Solved', value: lcSolved !== null ? lcSolved.toString() : '---', change: 'Problem Solving', trend: 'up' },
    { label: 'GitHub Repos', value: ghRepos !== null ? ghRepos.toString() : '---', change: 'Project Building', trend: 'up' },
    { label: 'Study Time', value: studyHours, change: 'Focus minutes', trend: 'up' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Professional Dashboard</h1>
          <p className="text-gray-500 mt-1">Holistic engineer profile & placement analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardBody className="p-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-3xl font-black ${stat.color || 'text-slate-900'}`}>{stat.value}</span>
              </div>
              <p className="mt-2 text-[10px] font-bold text-slate-500 uppercase opacity-60">
                {stat.change}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <WatchedVideos />
        <ActivityHeatmap />
      </div>
    </div>
  );
}
