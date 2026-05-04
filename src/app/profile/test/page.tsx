"use client";

import React from 'react';

export default function TestProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6">IP</div>
      <h1 className="text-4xl font-black text-slate-900 mb-2">Test Route Active!</h1>
      <p className="text-slate-500">If you can see this, your /profile routing is working perfectly.</p>
      <div className="mt-8 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 shadow-sm">
        Next step: Re-linking the dynamic handles.
      </div>
    </div>
  );
}
