"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";

export const DashboardPreview: React.FC = () => {
  const { session } = useAuth();

  if (!session) return null;

  return (
    <section className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Your Dashboard Snapshot
        </h2>
        <div className="rounded-xl shadow-lg overflow-hidden">
          <ActivityHeatmap days={365} />
        </div>
        <p className="mt-6 text-center text-gray-600">
          Your personalized heatmap shows daily study activity – videos watched, notes created, and materials opened.
        </p>
      </div>
    </section>
  );
};
