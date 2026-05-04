"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface RoadmapItem {
  id: string;
  topic_name: string;
  category: 'Fundamentals' | 'Advanced' | 'Development';
  description: string;
  verifier: 'leetcode' | 'github' | 'manual';
  condition?: string;
}

export default function ProfessionalRoadmap() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{lc: any, gh: any} | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(true);

  const topics: RoadmapItem[] = [
    { id: '1', topic_name: 'Basic Data Structures', category: 'Fundamentals', description: 'Arrays, Lists, and Strings.', verifier: 'leetcode', condition: 'totalSolved > 20' },
    { id: '2', topic_name: 'Algorithm Mastery', category: 'Fundamentals', description: 'Sorting, Searching, and Recursion.', verifier: 'leetcode', condition: 'mediumSolved > 10' },
    { id: '3', topic_name: 'Graph & Tree logic', category: 'Advanced', description: 'BFS, DFS, and Tree traversals.', verifier: 'leetcode', condition: 'hardSolved > 2' },
    { id: '4', topic_name: 'Dynamic Programming', category: 'Advanced', description: 'Sub-problems and optimization.', verifier: 'leetcode', condition: 'mediumSolved > 20' },
    { id: '5', topic_name: 'Version Control (Git)', category: 'Development', description: 'GitHub workflow and branching.', verifier: 'github', condition: 'publicRepos > 1' },
    { id: '6', topic_name: 'Frontend Mastery', category: 'Development', description: 'React, Tailwind, and Modern UI.', verifier: 'github', condition: 'React' },
    { id: '7', topic_name: 'Backend Architecture', category: 'Development', description: 'APIs, Databases, and Logic.', verifier: 'github', condition: 'Python' },
  ];

  useEffect(() => {
    if (user) {
      fetchProfessionalStats();
    }
    const timer = setTimeout(() => setIsGenerating(false), 1500);
    return () => clearTimeout(timer);
  }, [user]);

  async function fetchProfessionalStats() {
    try {
      const { data: profile } = await supabase.from('profiles').select('leetcode_stats, github_stats').eq('id', user!.id).single();
      if (profile) {
        setStats({ lc: profile.leetcode_stats, gh: profile.github_stats });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isVerified = (item: RoadmapItem) => {
    if (!stats) return false;
    if (item.verifier === 'leetcode' && stats.lc) {
      if (item.condition?.includes('totalSolved')) return stats.lc.totalSolved > 20;
      if (item.condition?.includes('mediumSolved')) {
          const val = parseInt(item.condition.split('>')[1]);
          return stats.lc.mediumSolved > val;
      }
      if (item.condition?.includes('hardSolved')) return stats.lc.hardSolved > 2;
    }
    if (item.verifier === 'github' && stats.gh) {
      if (item.condition === 'publicRepos > 1') return stats.gh.publicRepos > 1;
      // Check if language exists in GH stats
      return stats.gh.languages && Object.keys(stats.gh.languages).includes(item.condition!);
    }
    return false;
  };

  const getVerifiedCount = () => topics.filter(t => isVerified(t)).length;
  const readiness = Math.round((getVerifiedCount() / topics.length) * 100);

  if (isGenerating) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-6">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full shadow-[0_0_30px_rgba(37,99,235,0.6)]"></div>
        </motion.div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 animate-pulse uppercase tracking-widest">Neural Syncing...</h2>
          <p className="text-slate-500 font-medium">Cross-verifying LeetCode & GitHub identities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Professional Roadmap</h1>
          <p className="text-slate-500 mt-2 font-medium">Verified milestone tracking for SDE-1 career goals.</p>
        </div>
        <Card className="bg-slate-900 border-none shadow-xl p-6 rounded-[2rem] flex items-center gap-6">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Path Mastery</p>
              <h2 className="text-2xl font-black text-white">{readiness}%</h2>
           </div>
           <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500"></div>
           </div>
        </Card>
      </header>

      <div className="space-y-16">
        {['Fundamentals', 'Advanced', 'Development'].map((cat, catIdx) => (
          <section key={cat} className="space-y-8">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${cat === 'Development' ? 'bg-blue-600' : 'bg-slate-900'} flex items-center justify-center text-white font-black shadow-lg`}>
                {cat[0]}
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{cat}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.filter(t => t.category === cat).map((topic) => {
                const verified = isVerified(topic);
                return (
                  <motion.div key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.2 }}>
                    <Card className={`group border-2 transition-all duration-500 ${
                      verified ? 'border-emerald-500/20 bg-emerald-50/20' : 'border-slate-100 bg-white'
                    }`}>
                      <CardBody className="p-7">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1">
                            <h3 className="font-bold text-slate-900">{topic.topic_name}</h3>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{topic.description}</p>
                          </div>
                          {verified ? (
                            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg shadow-emerald-500/20">VERIFIED</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-2 py-1 rounded">PENDING</span>
                          )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Via {topic.verifier}</span>
                           <div className={`w-2 h-2 rounded-full ${verified ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`}></div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
