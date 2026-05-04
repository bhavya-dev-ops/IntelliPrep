"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getAllMaterials, recordActivity, addMaterial, Material } from '@/lib/materials';
import { logActivity } from '@/lib/activity';
import { Card, CardBody } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { VideoModule } from '@/components/dashboard/VideoModule';

export default function VideosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function fetchMaterials() {
      if (user) {
        const data = await getAllMaterials(user.id);
        setMaterials(data);
      }
      setLoading(false);
    }
    fetchMaterials();
  }, [user]);

  const handleValidatedAdd = async (videoData: { title: string; url: string; thumbnail: string }) => {
    if (!user) return;
    
    setIsAdding(true);
    const added = await addMaterial(videoData.title, videoData.url, user.id, videoData.thumbnail);
    
    if (added) {
      setMaterials([added, ...materials]);
    }
    setIsAdding(false);
  };

  const handleWatch = async (materialId: string, url: string) => {
    if (!user) return;
    setWatching(materialId);
    const success = await recordActivity(user.id, materialId);
    if (success) {
      logActivity(user.id, 'video');
      window.open(url, '_blank');
      router.push('/dashboard');
    }
    setWatching(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your videos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Videos</h1>
          <p className="text-gray-500 mt-1">Manage and watch your personal study library.</p>
        </div>
      </div>

      {/* Educational Video Firewall Module */}
      <VideoModule onValidatedAdd={handleValidatedAdd} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.length === 0 ? (
          <div className="lg:col-span-3 py-12 text-center text-gray-400">
            No videos added yet. Add your first YouTube video above!
          </div>
        ) : (
          materials.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="relative aspect-video bg-gray-100">
                <img 
                  src={item.thumbnail_url} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleWatch(item.id, item.url)}
                    disabled={watching === item.id}
                    className="bg-primary text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
                  >
                    Watch Now
                  </button>
                </div>
              </div>
              <CardBody className="p-4">
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.title}</h3>
                <p className="text-xs text-gray-400 mt-2">Added to your personal library</p>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
