"use client";

import React, { useEffect, useState } from 'react';
import { getActivityHeatmapData } from '@/lib/activity';
import { useAuth } from '@/hooks/useAuth';

export function ActivityHeatmap() {
  const { user } = useAuth();
  const [data, setData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getActivityHeatmapData(user.id).then(res => {
        setData(res);
        setLoading(false);
      });
    }
  }, [user]);

  // Generate last 365 days
  const days = Array.from({ length: 365 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (364 - i));
    return d.toISOString().split('T')[0];
  });

  const getColor = (count: number) => {
    if (!count) return 'bg-gray-100';
    if (count < 3) return 'bg-green-200';
    if (count < 6) return 'bg-green-400';
    return 'bg-green-700';
  };

  if (loading) return <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          Learning Consistency
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-max">
          {days.map((date) => {
            const count = data[date] || 0;
            return (
              <div
                key={date}
                className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 cursor-help ${getColor(count)}`}
                title={`${date}: ${count} activities`}
              ></div>
            );
          })}
        </div>
      </div>
      
      <p className="mt-4 text-[10px] text-gray-400 font-medium">
        Tracking your daily engagement across Videos, Notes, and Materials.
      </p>
    </div>
  );
}
