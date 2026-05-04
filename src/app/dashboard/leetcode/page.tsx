"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { saveLeetCodeUsername, getLeetCodeUsername, verifyRoadmapProgress, LeetCodeStats } from '@/lib/leetcode';
import { fetchGitHubStats, savePlacementIntegration, GitHubStats } from '@/lib/placement';
import { logActivity } from '@/lib/activity';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import { X, RotateCcw, Zap, ExternalLink, Share2, Check } from 'lucide-react';

const PROBLEM_POOL = [
  { id: 1, name: 'Two Sum', difficulty: 'Easy', tag: 'Arrays', link: 'https://leetcode.com/problems/two-sum/', reason: 'Master the HashMap lookup pattern.' },
  { id: 2, name: 'Valid Parentheses', difficulty: 'Easy', tag: 'Stacks', link: 'https://leetcode.com/problems/valid-parentheses/', reason: 'Foundation for stack-based parsing.' },
  { id: 20, name: 'Number of Islands', difficulty: 'Medium', tag: 'Graphs/DFS', link: 'https://leetcode.com/problems/number-of-islands/', reason: 'The definitive graph traversal problem.' },
];

export default function PlacementSyncPage() {
  const { user, refreshUserData } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [lcUsername, setLcUsername] = useState('');
  const [ghUsername, setGhUsername] = useState('');
  const [lcStats, setLcStats] = useState<LeetCodeStats | null>(null);
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null);
  const [syncingLC, setSyncingLC] = useState(false);
  const [syncingGH, setSyncingGH] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const savedLC = localStorage.getItem('lc_user');
    const savedGH = localStorage.getItem('gh_user');
    
    if (savedLC) {
      setLcUsername(savedLC);
      handleLCSync(savedLC);
    }
    if (savedGH) {
      setGhUsername(savedGH);
      handleGHSync(savedGH);
    }
  }, []);

  const handleLCSync = async (name = lcUsername) => {
    if (!name || !user) return;
    setSyncingLC(true);
    setError('');
    try {
      const response = await fetch(`/api/leetcode?username=${name}`);
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setLcStats(data);
        localStorage.setItem('lc_user', name);
        
        const lcScore = Math.min((data.totalSolved / 200) * 100, 100);
        const ghScore = ghStats ? Math.min((ghStats.publicRepos / 10) * 100, 100) : 0;
        const totalReadiness = Math.round((lcScore * 0.6) + (ghScore * 0.4));

        await supabase.from('profiles').upsert({
          id: user.id,
          leetcode_solved: data.totalSolved,
          leetcode_username: name,
          leetcode_stats: data,
          sde_readiness: totalReadiness,
          updated_at: new Date().toISOString()
        });

        await savePlacementIntegration(user.id, 'leetcode', name, data);
        await verifyRoadmapProgress(user.id, data);
        refreshUserData();
      } else { setError('LeetCode profile not found.'); }
    } catch (err) { setError('Sync failed.'); }
    finally { setSyncingLC(false); }
  };

  const handleGHSync = async (name = ghUsername) => {
    if (!name || !user) return;
    setSyncingGH(true);
    setError('');
    try {
      const data = await fetchGitHubStats(name);
      if (data) {
        setGhStats(data);
        localStorage.setItem('gh_user', name);
        
        const lcScore = lcStats ? Math.min((lcStats.totalSolved / 200) * 100, 100) : 0;
        const ghScore = Math.min((data.publicRepos / 10) * 100, 100);
        const totalReadiness = Math.round((lcScore * 0.6) + (ghScore * 0.4));

        await supabase.from('profiles').upsert({
          id: user.id,
          github_repos: data.publicRepos,
          github_username: name,
          github_stats: data,
          sde_readiness: totalReadiness,
          updated_at: new Date().toISOString()
        });

        await savePlacementIntegration(user.id, 'github', name, data);
        refreshUserData();
      } else { setError('GitHub profile not found.'); }
    } catch (err) { setError('Sync failed.'); }
    finally { setSyncingGH(false); }
  };

  const clearInput = (type: 'lc' | 'gh') => {
    if (type === 'lc') {
      setLcUsername('');
      localStorage.removeItem('lc_user');
      setLcStats(null);
    } else {
      setGhUsername('');
      localStorage.removeItem('gh_user');
      setGhStats(null);
    }
  };

  const getReadinessScore = () => {
    if (!lcStats && !ghStats) return 0;
    const lcScore = lcStats ? Math.min((lcStats.totalSolved / 200) * 100, 100) : 0;
    const ghScore = ghStats ? Math.min((ghStats.publicRepos / 10) * 100, 100) : 0;
    return Math.round((lcScore * 0.6) + (ghScore * 0.4));
  };

  const getRadarData = (s: LeetCodeStats) => [
    { subject: 'Arrays', A: Math.min(80, (s.easySolved * 0.5) + (s.mediumSolved * 0.2)) },
    { subject: 'Strings', A: Math.min(80, (s.easySolved * 0.3) + (s.mediumSolved * 0.4)) },
    { subject: 'Graphs', A: Math.min(80, (s.mediumSolved * 0.6) + (s.hardSolved * 0.4)) },
    { subject: 'DP', A: Math.min(80, (s.mediumSolved * 0.3) + (s.hardSolved * 0.7)) },
    { subject: 'Math', A: Math.min(80, (s.easySolved * 0.4) + (s.mediumSolved * 0.1)) },
  ];

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Placement Sync</h1>
          <p className="text-slate-500 mt-2 font-medium">Unified engineering profile & professional analytics.</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
           <div className="text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">SDE-1 Readiness</p>
              <h2 className="text-3xl font-black text-white">{getReadinessScore()}%</h2>
           </div>
           <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 flex items-center justify-center relative">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-black text-xs">AI</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { type: 'lc', title: 'LeetCode Identity', icon: '🟡', val: lcUsername, set: setLcUsername, syncing: syncingLC, color: 'amber', action: handleLCSync },
          { type: 'gh', title: 'GitHub Identity', icon: '🐙', val: ghUsername, set: setGhUsername, syncing: syncingGH, color: 'blue', action: handleGHSync }
        ].map((p) => (
          <Card key={p.type} className="bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
            <CardBody className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>{p.icon}</div>
                  <div><h3 className="text-white text-lg font-black">{p.title}</h3><p className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Verified</p></div>
                </div>
                {p.val && <button onClick={() => clearInput(p.type as any)} className="text-slate-500 hover:text-rose-500 p-2"><X size={16} /></button>}
              </div>
              <div className="flex gap-3">
                <input type="text" value={p.val} onChange={(e)=>p.set(e.target.value)} placeholder="Username" className="bg-white/5 border border-white/10 text-white px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-white/20 flex-1"/>
                <button onClick={()=>p.action()} disabled={p.syncing} className={`${p.type === 'lc' ? 'bg-amber-500 text-slate-900' : 'bg-blue-500 text-white'} px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-2`}>
                  {p.syncing ? '...' : <RotateCcw size={18} />}
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {(lcStats || ghStats) && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {lcStats && (
              <Card className="bg-slate-900 border-none shadow-xl rounded-[2rem] lg:col-span-2">
                <CardBody className="p-8">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">Problem Solving Skill DNA</p>
                  <div className="h-[300px] w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(lcStats)}>
                          <PolarGrid stroke="#334155" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                          <Radar name="Skills" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
            {ghStats && (
              <Card className="bg-slate-900 border-none shadow-xl rounded-[2rem]">
                <CardBody className="p-8">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8">Language Proficiency</p>
                  <div className="h-[220px]">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart><Pie data={Object.entries(ghStats.languages).map(([name, value]) => ({ name, value }))} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {Object.entries(ghStats.languages).map((_, i) => <Cell key={i} fill={['#f59e0b', '#3b82f6', '#10b981', '#ef4444'][i % 4]} />)}
                        </Pie><Tooltip /></PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {lcStats && (
            <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><Zap className="text-amber-500" /> A.I Next Challenges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PROBLEM_POOL.map((p) => (
                  <Card key={p.id} className="bg-white border-2 border-slate-100 rounded-3xl hover:border-amber-500/20 transition-all">
                    <CardBody className="p-7">
                      <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-1 rounded-full uppercase mb-4 block w-fit">{p.difficulty}</span>
                      <h4 className="font-black text-slate-900 mb-1">{p.name}</h4>
                      <p className="text-slate-500 text-[10px] leading-relaxed mb-6">{p.reason}</p>
                      <button onClick={() => window.open(p.link, '_blank')} className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2">Start <ExternalLink size={12} /></button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {ghStats && (
            <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-900">🚀 Top Repositories</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ghStats.topRepos.map((repo, i) => (
                  <Card key={i} className="bg-white border-2 border-slate-100 rounded-3xl">
                    <CardBody className="p-7 flex flex-col justify-between h-full">
                      <div><div className="flex justify-between mb-4"><h4 className="font-black text-slate-900">{repo.name}</h4><span className="text-amber-500 font-bold text-xs">⭐ {repo.stars}</span></div><p className="text-slate-500 text-xs line-clamp-2">{repo.description}</p></div>
                      <div className="mt-6 flex items-center justify-between"><span className="text-[10px] font-black text-blue-500 uppercase">{repo.language}</span><a href={repo.url} target="_blank" className="text-xs font-black text-slate-900 underline">View</a></div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
