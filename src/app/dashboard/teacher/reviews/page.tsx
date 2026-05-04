"use client";

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Inbox, Zap, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const mockReviews = [
  { id: '1', name: 'Bhavya Bansal', status: 'Pending', type: 'Final Placement Review', time: '2h ago' },
  { id: '2', name: 'Rahul Sharma', status: 'Reviewed', type: 'GitHub Sync Verification', time: '1d ago' },
  { id: '3', name: 'Priya Singh', status: 'Pending', type: 'SDE-1 Readiness Audit', time: '5h ago' },
];

export default function ReviewInboxPage() {
  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Inbox className="text-primary" /> Review Inbox
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Manage manual verification requests and audit student profiles.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {mockReviews.map((review) => (
          <Card key={review.id} className="bg-white border-none shadow-sm hover:shadow-md transition-all rounded-2xl group">
            <CardBody className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  review.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {review.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{review.name}</h3>
                  <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                    <Zap size={14} className="text-primary" /> {review.type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-12">
                <div className="text-right hidden md:block">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    review.status === 'Pending' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {review.status}
                  </p>
                  <p className="text-slate-400 text-xs flex items-center gap-1 justify-end mt-1">
                    <Clock size={12} /> {review.time}
                  </p>
                </div>
                <Link 
                  href="/dashboard/teacher/analytics" 
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-primary transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                >
                  Review Now <ArrowRight size={14} />
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
