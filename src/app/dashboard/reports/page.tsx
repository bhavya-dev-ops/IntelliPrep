"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [stats, setStats] = useState({
    personality: '',
    focusScore: 0,
    bestDay: '',
    bestTime: '',
    weakArea: '',
    suggestions: [] as string[],
    totalActivities: 0,
    studyIntensity: [] as number[]
  });

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;

      setLoading(true);
      setStats({
        personality: '',
        focusScore: 0,
        bestDay: '',
        bestTime: '',
        weakArea: '',
        suggestions: [],
        totalActivities: 0,
        studyIntensity: []
      });

      try {
        const userId = session.user.id;
        
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const { count: tCount } = await supabase
          .from('activity_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfDay.toISOString());
        setTodayCount(tCount || 0);

        const { data: logs, error: logsError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (logsError) throw logsError;

        if (logs && logs.length > 0) {
          const types = logs.map(l => l.activity_type);
          const counts = types.reduce((acc: any, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {});
          const topType = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0];
          
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayCounts = logs.reduce((acc: any, l) => {
            const d = new Date(l.created_at).getDay();
            acc[d] = (acc[d] || 0) + 1;
            return acc;
          }, {});
          const bestDayIdx = Object.entries(dayCounts).sort((a: any, b: any) => b[1] - a[1])[0][0];

          const hourCounts = logs.reduce((acc: any, l) => {
            const h = new Date(l.created_at).getHours();
            acc[h] = (acc[h] || 0) + 1;
            return acc;
          }, {});
          const bestHour = Object.entries(hourCounts).sort((a: any, b: any) => b[1] - a[1])[0][0];

          const recentLogs = logs.filter(l => (new Date().getTime() - new Date(l.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000));
          const fScore = Math.min(Math.round((recentLogs.length / 5) * 100), 100);

          const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });
          const intensity = last7Days.map(dateStr => logs.filter(l => l.created_at.startsWith(dateStr)).length * 10 || 5);

          setStats({
            personality: topType === 'video' ? 'Visual Learner' : topType === 'note' ? 'Active Synthesizer' : 'Resourceful Explorer',
            focusScore: fScore,
            bestDay: days[parseInt(bestDayIdx)],
            bestTime: `${parseInt(bestHour)}:00 ${parseInt(bestHour) >= 12 ? 'PM' : 'AM'}`,
            weakArea: topType === 'video' ? 'Deep Reading' : 'Visual Retention',
            suggestions: [`Review notes from ${days[parseInt(bestDayIdx)]}`, 'Spend 20 mins on Materials', 'Complete daily goal'],
            totalActivities: logs.length,
            studyIntensity: intensity
          });
        } else {
          setStats(prev => ({ ...prev, totalActivities: 0 }));
        }
      } catch (err) {
        console.error('Report fetch error:', err);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    }
    fetchData();
  }, [session?.user?.id]);

  const getAISuggestion = () => {
    if (todayCount === 0) return { msg: "You haven’t studied today. Start small—even 15 minutes counts.", type: 'danger', icon: '⚠️', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700' };
    if (todayCount! < 3) return { msg: "You’ve made a start. One more focused session will improve your progress.", type: 'warning', icon: '⏳', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' };
    return { msg: "Excellent work today. Keep this consistency going.", type: 'success', icon: '✅', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' };
  };

  const suggest = todayCount !== null ? getAISuggestion() : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10 pb-20"
    >
      <header>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-4xl font-black text-slate-900 tracking-tight"
        >
          A.I Report
        </motion.h1>
        <p className="text-slate-500 mt-2 font-medium">Your personalized performance analysis.</p>
      </header>

      {/* AI Suggestion Section */}
      <div className="min-h-[140px]">
        {loading || todayCount === null ? (
          <div className="h-[140px] bg-slate-100 rounded-[2rem] animate-pulse border border-slate-200"></div>
        ) : (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${suggest?.bg} ${suggest?.border} border-2 shadow-sm rounded-[2rem] overflow-hidden transition-all duration-500 p-8 flex items-center gap-8 group hover:shadow-md hover:scale-[1.01]`}
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner bg-white/50 backdrop-blur-sm transition-transform group-hover:scale-110`}
            >
              {suggest?.icon}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`font-black text-xl ${suggest?.text} tracking-tight`}>A.I Suggestion</h3>
                <span className={`${suggest?.text} text-[10px] font-black uppercase tracking-[0.2em] opacity-40`}>• Today</span>
              </div>
              <p className={`text-lg md:text-xl font-bold ${suggest?.text} leading-snug opacity-90`}>
                "{suggest?.msg}"
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Card 1: Focus Score */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="h-[280px]">
          {loading ? (
            <div className="h-full bg-slate-100 rounded-3xl animate-pulse"></div>
          ) : stats.totalActivities === 0 ? (
             <Card className="h-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-2xl">🌱</div>
                <h3 className="font-bold text-slate-900 text-xl">Ready to start?</h3>
                <p className="text-slate-500 text-sm mb-6">Complete your first session to unlock insights.</p>
                <Link href="/dashboard/materials">
                  <button className="bg-slate-900 text-white rounded-xl px-6 py-2 font-bold text-sm">Go Study</button>
                </Link>
             </Card>
          ) : (
            <Card className="h-full border-none shadow-2xl rounded-3xl overflow-hidden relative transition-all duration-700 bg-slate-900">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14H11V21L20 10H13Z" /></svg>
              </div>
              <CardBody className="p-10 flex flex-col justify-between h-full relative z-10">
                <div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4">Focus Score</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-8xl font-black text-white tracking-tighter">{stats.focusScore}</h2>
                    <span className="text-3xl font-bold text-white/20">/100</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.focusScore}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-indigo-500 rounded-full"
                  ></motion.div>
                </div>
              </CardBody>
            </Card>
          )}
        </motion.div>

        {/* Card 2: Study Persona */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="h-[280px]">
          {loading ? (
            <div className="h-full bg-slate-100 rounded-3xl animate-pulse"></div>
          ) : stats.totalActivities === 0 ? (
            <Card className="h-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-2xl">🧠</div>
                <h3 className="font-bold text-slate-900 text-xl">New Scholar</h3>
                <p className="text-slate-500 text-sm">Study more to reveal your learning personality.</p>
             </Card>
          ) : (
            <Card className="h-full border-none shadow-2xl rounded-3xl overflow-hidden relative transition-all duration-700 bg-emerald-950">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
              </div>
              <CardBody className="p-10 flex flex-col justify-between h-full relative z-10">
                <div>
                  <p className="text-emerald-400/60 font-black uppercase tracking-widest text-[10px] mb-4">Study Persona</p>
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-4xl font-black text-white leading-tight tracking-tight"
                  >
                    {stats.personality}
                  </motion.h2>
                </div>
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4"
                >
                  <p className="text-emerald-100/70 text-xs font-medium leading-relaxed">
                    Based on your engagement patterns, you excel at processing {stats.personality?.toLowerCase().includes('visual') ? 'visual flows' : 'structured notes'}.
                  </p>
                </motion.div>
              </CardBody>
            </Card>
          )}
        </motion.div>

        {/* Card 3: Consistency */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="h-[280px]">
          {loading ? (
            <div className="h-full bg-slate-100 rounded-3xl animate-pulse"></div>
          ) : stats.totalActivities === 0 ? (
            <Card className="h-full bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center rounded-3xl">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-2xl">📅</div>
                <h3 className="font-bold text-slate-900 text-xl">Day 1</h3>
                <p className="text-slate-500 text-sm">We'll track your prime study times soon!</p>
             </Card>
          ) : (
            <Card className="h-full border-none shadow-2xl rounded-3xl overflow-hidden relative transition-all duration-700 bg-indigo-950">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <svg className="w-40 h-40 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" /></svg>
              </div>
              <CardBody className="p-10 flex flex-col justify-between h-full relative z-10">
                <div>
                  <p className="text-indigo-400/60 font-black uppercase tracking-widest text-[10px] mb-4">Consistency</p>
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-white font-black text-2xl">{stats.bestDay}</span>
                      <span className="text-indigo-300/50 text-[10px] uppercase font-bold">Prime Day</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-black text-2xl">{stats.bestTime}</span>
                      <span className="text-indigo-300/50 text-[10px] uppercase font-bold">Peak Hour</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <Card className="border-slate-100 border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <CardBody className="p-10">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="text-orange-500">✨</span> Smart Revision
            </h3>
            <div className="space-y-4">
              {(stats.totalActivities > 0 ? stats.suggestions : ['Start studying to get tips']).map((s, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -10, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 p-5 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-lg border border-transparent hover:border-orange-100 transition-all cursor-pointer"
                >
                  <div className="w-3 h-3 rounded-full bg-orange-400 group-hover:scale-125 transition-transform"></div>
                  <span className="text-slate-700 font-bold">{s}</span>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border-slate-100 border-2 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
          <CardBody className="p-10 flex flex-col">
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="text-rose-500">⚡</span> Growth Opportunity
            </h3>
            <div className="bg-rose-50/50 p-8 rounded-3xl border border-rose-100 flex-1 flex flex-col justify-center text-center">
              <p className="text-rose-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Critical Focus</p>
              <p className="text-slate-900 font-black text-3xl mb-4">{stats.totalActivities > 0 ? stats.weakArea : 'New Horizons'}</p>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                {stats.totalActivities > 0 
                  ? `Our AI detected a dip in your ${stats.weakArea?.toLowerCase()}. A targeted 15-min session will balance your profile.`
                  : "Welcome! Once you start studying, our AI will identify your growth areas and help you improve faster."
                }
              </p>
              <Link href="/dashboard/materials">
                <button className="w-full py-4 bg-rose-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all">
                  Take the Challenge
                </button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
