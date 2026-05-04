"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWatchedVideos, WatchHistory } from '@/lib/materials';
import { Card, CardBody } from '@/components/ui/Card';

export const WatchedVideos: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        const data = await getWatchedVideos(user.id);
        setHistory(data);
      }
      setLoading(false);
    }

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No videos watched yet</h3>
          <p className="text-gray-500 max-w-xs">Start your learning journey by watching your first study material.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {history.map((item) => (
        <Card key={item.id} className="group hover:shadow-lg transition-shadow duration-300">
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            <img 
              src={item.materials.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'} 
              alt={item.materials.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2 right-2">
              <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Watched
              </span>
            </div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl">
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
          <CardBody className="p-4">
            <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{item.materials.title}</h4>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>{new Date(item.watched_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1 text-primary font-medium">
                View Again
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
