"use client";

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';

const mockTrendData = [
  { name: 'Week 1', avg: 15 },
  { name: 'Week 2', avg: 32 },
  { name: 'Week 3', avg: 45 },
  { name: 'Week 4', avg: 62 },
];

export default function ClassPerformancePage() {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <TrendingUp className="text-emerald-500" /> Class Performance Analytics
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Analyzing historical growth and placement benchmarks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-none shadow-md rounded-[2rem]">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Award size={20}/></div>
              <h3 className="font-black text-slate-900">Class Average</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">64%</p>
            <p className="text-xs font-bold text-emerald-500 mt-2">↑ 12% from last month</p>
          </CardBody>
        </Card>
        
        <Card className="bg-white border-none shadow-md rounded-[2rem]">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Clock size={20}/></div>
              <h3 className="font-black text-slate-900">Avg. Study Time</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">4.2h</p>
            <p className="text-xs font-bold text-slate-400 mt-2">Per student / day</p>
          </CardBody>
        </Card>

        <Card className="bg-white border-none shadow-md rounded-[2rem]">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Target size={20}/></div>
              <h3 className="font-black text-slate-900">Placement Ready</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">12 / 45</p>
            <p className="text-xs font-bold text-amber-500 mt-2">Students at 80%+</p>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-white border-none shadow-xl rounded-[2.5rem]">
        <CardBody className="p-10">
          <h3 className="text-xl font-black text-slate-900 mb-8">Skill Growth Trend</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="avg" fill="#10b981" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
