"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { getMarksForStudent, MarkRecord } from '@/lib/marks';
import { getStudentCGPA, saveCGPA } from '@/lib/cgpa';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Award, TrendingUp, Target, BookOpen, GraduationCap, Save } from 'lucide-react';

export default function StudentMarksPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [cgpa, setCgpa] = useState<number | null>(null);
  const [isEditingCgpa, setIsEditingCgpa] = useState(false);
  const [newCgpa, setNewCgpa] = useState('');
  const [savingCgpa, setSavingCgpa] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [marksData, cgpaData] = await Promise.all([
      getMarksForStudent(user.id),
      getStudentCGPA(user.id)
    ]);
    
    // Sort by created at ascending for trends
    const sortedData = [...marksData].reverse();
    setMarks(sortedData);
    if (cgpaData) setCgpa(cgpaData.cgpa);
    
    if (sortedData.length > 0) {
      let totalObtained = 0;
      let totalMax = 0;
      const trendData = sortedData.map(m => {
        totalObtained += m.obtained_marks;
        totalMax += m.max_marks;
        return {
          name: m.subject.substring(0, 10) + (m.subject.length > 10 ? '...' : ''),
          percentage: Math.round((m.obtained_marks / m.max_marks) * 100),
          exam: m.exam_type
        };
      });

      setAnalytics({
        overallPercentage: Math.round((totalObtained / totalMax) * 100),
        trendData,
        totalExams: sortedData.length
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Your Performance...</p>
      </div>
    );
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (percentage >= 80) return { grade: 'A', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (percentage >= 60) return { grade: 'C', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' };
    if (percentage >= 40) return { grade: 'D', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { grade: 'F', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' };
  };

  const handleCgpaSave = async () => {
    if (!user || !newCgpa) return;
    const val = parseFloat(newCgpa);
    if (isNaN(val) || val < 0 || val > 10) {
      alert("Please enter a valid CGPA between 0 and 10");
      return;
    }

    setSavingCgpa(true);
    try {
      await saveCGPA(user.id, val);
      setCgpa(val);
      setIsEditingCgpa(false);
      setNewCgpa('');
    } catch (err) {
      alert("Failed to save CGPA");
    } finally {
      setSavingCgpa(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Award className="text-primary" /> My Performance
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Track your academic progress and marks across subjects.</p>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
          <CardBody className="p-6 relative z-10">
            <h3 className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-2 flex items-center gap-2"><Target size={14}/> Overall Percentage</h3>
            <p className="text-5xl font-black">{analytics?.overallPercentage || 0}%</p>
          </CardBody>
          <div className="absolute -right-6 -bottom-6 opacity-10">
             <Award size={120} />
          </div>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><TrendingUp size={14}/> Current Grade</h3>
            <p className={`text-5xl font-black ${getGrade(analytics?.overallPercentage || 0).color}`}>
               {analytics ? getGrade(analytics.overallPercentage).grade : '-'}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-3xl">
          <CardBody className="p-6">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-2"><BookOpen size={14}/> Total Assessments</h3>
            <p className="text-5xl font-black text-slate-900">{analytics?.totalExams || 0}</p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl rounded-3xl relative overflow-hidden group">
          <CardBody className="p-6 relative z-10">
            <div className="flex justify-between items-start">
               <h3 className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-2 flex items-center gap-2">
                 <GraduationCap size={14}/> My CGPA
               </h3>
               {!isEditingCgpa ? (
                 <button 
                   onClick={() => { setIsEditingCgpa(true); setNewCgpa(cgpa?.toString() || ''); }}
                   className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                 >
                   Edit
                 </button>
               ) : (
                 <div className="flex gap-2">
                   <button 
                     onClick={handleCgpaSave}
                     disabled={savingCgpa}
                     className="p-1 bg-emerald-500 rounded-full hover:bg-emerald-600 transition-colors"
                   >
                     <Save size={14} />
                   </button>
                   <button 
                     onClick={() => setIsEditingCgpa(false)}
                     className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                   >
                     <Target size={14} className="rotate-45" />
                   </button>
                 </div>
               )}
            </div>
            {isEditingCgpa ? (
              <input 
                type="number"
                step="0.01"
                min="0"
                max="10"
                autoFocus
                className="bg-white/10 border-b-2 border-white/30 text-4xl font-black w-full outline-none py-1 mt-1 placeholder:text-white/30"
                placeholder="0.00"
                value={newCgpa}
                onChange={e => setNewCgpa(e.target.value)}
              />
            ) : (
              <p className="text-5xl font-black mt-1">{cgpa !== null ? cgpa.toFixed(2) : '--'}</p>
            )}
          </CardBody>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
             <GraduationCap size={100} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Trend */}
        <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
             <h2 className="text-xl font-black text-slate-900">Performance Trend</h2>
          </CardHeader>
          <CardBody className="p-8">
            {analytics?.trendData ? (
              <div className="h-80 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.trendData}>
                        <defs>
                          <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} domain={[0, 100]} />
                        <Tooltip cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorPercentage)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                No trend data available
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Subject Breakdown */}
        <div className="space-y-4 flex flex-col">
          <h2 className="text-xl font-black text-slate-900 px-4">Subject Breakdown</h2>
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 pr-2">
            {[...marks].reverse().map(m => {
              const percentage = Math.round((m.obtained_marks / m.max_marks) * 100);
              const gradeInfo = getGrade(percentage);
              return (
                <div key={m.id} className={`p-5 rounded-3xl border-2 ${gradeInfo.border} ${gradeInfo.bg} transition-all hover:scale-[1.02]`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{m.subject}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{m.exam_type}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-lg shadow-sm ${gradeInfo.color}`}>
                      {gradeInfo.grade}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                     <div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{m.obtained_marks} <span className="text-sm text-slate-400 font-bold">/ {m.max_marks}</span></p>
                     </div>
                     <span className={`text-[10px] font-black px-2 py-1 rounded bg-white shadow-sm ${gradeInfo.color}`}>{percentage}%</span>
                  </div>
                </div>
              );
            })}
            {marks.length === 0 && (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No subjects recorded</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
