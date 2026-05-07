"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { supabase } from '@/lib/supabaseClient';
import { addMark, getMarksForStudent, getAllMarksForTeacher, MarkRecord, deleteMark } from '@/lib/marks';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Trash2, Award, AlertCircle } from 'lucide-react';

export default function MarksManagementPage() {
  const { userData, user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subject, setSubject] = useState('');
  const [examType, setExamType] = useState('Mid Term');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [formError, setFormError] = useState('');

  // Analytics Data
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    // Fetch students from both tables to get the proper name
    const [{ data: profiles }, { data: usersData }] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('users').select('id, name')
    ]);

    let mergedStudents: any[] = [];
    if (profiles) {
      mergedStudents = profiles.map(p => {
        const u = usersData?.find((u: any) => u.id === p.id);
        return {
          ...p,
          real_name: u?.name || null
        };
      });
      setStudents(mergedStudents);
    }

    // Fetch marks
    const marksData = await getAllMarksForTeacher(user.id);
    setMarks(marksData);
    
    generateAnalytics(marksData);
    setLoading(false);
  };

  const generateAnalytics = (data: MarkRecord[]) => {
    if (data.length === 0) {
      setAnalytics(null);
      return;
    }

    const ranges = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    let total = 0;
    let highest = 0;
    let lowest = 100;
    let passes = 0;

    data.forEach(m => {
      const percentage = (m.obtained_marks / m.max_marks) * 100;
      
      if (percentage <= 20) ranges['0-20']++;
      else if (percentage <= 40) ranges['21-40']++;
      else if (percentage <= 60) ranges['41-60']++;
      else if (percentage <= 80) ranges['61-80']++;
      else ranges['81-100']++;

      total += percentage;
      if (percentage > highest) highest = percentage;
      if (percentage < lowest) lowest = percentage;
      if (percentage >= 40) passes++;
    });

    const distData = Object.keys(ranges).map(key => ({
      name: key,
      count: ranges[key as keyof typeof ranges],
      color: key === '0-20' ? '#f43f5e' : key === '81-100' ? '#10b981' : '#3b82f6'
    }));

    setAnalytics({
      distribution: distData,
      average: Math.round(total / data.length),
      highest: Math.round(highest),
      lowest: Math.round(lowest),
      passPercentage: Math.round((passes / data.length) * 100)
    });
  };

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedStudent || !subject || !obtainedMarks || !maxMarks) {
      setFormError('Please fill in all fields.');
      return;
    }

    const obtained = Number(obtainedMarks);
    const max = Number(maxMarks);

    if (obtained > max) {
      setFormError('Obtained marks cannot exceed maximum marks.');
      return;
    }
    if (obtained < 0 || max <= 0) {
      setFormError('Invalid marks entered.');
      return;
    }

    try {
      await addMark({
        student_id: selectedStudent,
        teacher_id: user?.id || 'unknown',
        subject,
        exam_type: examType,
        obtained_marks: obtained,
        max_marks: max
      });
      
      setObtainedMarks('');
      setSubject('');
      fetchData();
      alert('Marks added successfully!');
    } catch (err) {
      setFormError('Failed to add marks.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete these marks?')) {
      await deleteMark(id);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Marks Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Award className="text-primary" /> Marks Management
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Record and analyze student performance.</p>
      </header>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-white border-none shadow-md rounded-3xl">
            <CardBody className="p-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Class Average</h3>
              <p className="text-3xl font-black text-slate-900">{analytics.average}%</p>
            </CardBody>
          </Card>
          <Card className="bg-white border-none shadow-md rounded-3xl">
            <CardBody className="p-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Highest Score</h3>
              <p className="text-3xl font-black text-emerald-500">{analytics.highest}%</p>
            </CardBody>
          </Card>
          <Card className="bg-white border-none shadow-md rounded-3xl">
            <CardBody className="p-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Lowest Score</h3>
              <p className="text-3xl font-black text-rose-500">{analytics.lowest}%</p>
            </CardBody>
          </Card>
          <Card className="bg-slate-900 border-none shadow-md rounded-3xl">
            <CardBody className="p-6">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Pass Rate</h3>
              <p className="text-3xl font-black text-white">{analytics.passPercentage}%</p>
            </CardBody>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50">
             <h2 className="text-xl font-black text-slate-900">Add New Marks</h2>
          </CardHeader>
          <CardBody className="p-8">
            <form onSubmit={handleAddMark} className="space-y-5">
              {formError && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={16} /> {formError}
                </div>
              )}
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select a Student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.real_name || s.full_name || s.leetcode_username || s.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Subject</label>
                <input 
                  type="text"
                  placeholder="e.g. Data Structures"
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Exam Type</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                  value={examType}
                  onChange={e => setExamType(e.target.value)}
                >
                  <option value="Mid Term">Mid Term</option>
                  <option value="Final">Final Exam</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Obtained</label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    value={obtainedMarks}
                    onChange={e => setObtainedMarks(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Max Marks</label>
                  <input 
                    type="number"
                    placeholder="100"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
                    value={maxMarks}
                    onChange={e => setMaxMarks(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-4">
                <Plus size={16} /> Save Record
              </button>
            </form>
          </CardBody>
        </Card>

        {/* Analytics Chart */}
        <Card className="lg:col-span-2 bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-8 border-b border-slate-50 flex justify-between items-center">
             <h2 className="text-xl font-black text-slate-900">Marks Distribution</h2>
          </CardHeader>
          <CardBody className="p-8">
            {analytics ? (
              <div className="h-80 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                          {analytics.distribution.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                No data to display
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Marks List */}
      <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden mt-8">
        <CardHeader className="p-8 border-b border-slate-50">
            <h2 className="text-xl font-black text-slate-900">Recent Records</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-6">Student</th>
                  <th className="p-6">Subject</th>
                  <th className="p-6">Exam</th>
                  <th className="p-6">Marks</th>
                  <th className="p-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {marks.map(m => {
                  const student = students.find(s => s.id === m.student_id);
                  const percentage = Math.round((m.obtained_marks / m.max_marks) * 100);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-6 font-bold text-slate-900 text-sm">
                        {student?.real_name || student?.full_name || student?.leetcode_username || 'Unknown'}
                      </td>
                      <td className="p-6 font-medium text-slate-600 text-sm">{m.subject}</td>
                      <td className="p-6">
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{m.exam_type}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-900">{m.obtained_marks} <span className="text-slate-400 font-medium">/ {m.max_marks}</span></span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${percentage >= 80 ? 'bg-emerald-100 text-emerald-700' : percentage >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {marks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

    </div>
  );
}
