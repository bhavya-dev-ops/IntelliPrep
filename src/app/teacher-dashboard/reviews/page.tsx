"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardBody } from '@/components/ui/Card';
import { Inbox, Zap, ArrowRight, Clock, UserCheck, RefreshCw, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { sendNotification } from '@/lib/notifications';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  name: string;
  full_name?: string;
  leetcode_username: string;
  leetcode_solved: number;
  github_repos: number;
  updated_at: string;
  sde_readiness: number;
  study_time_seconds: number;
}

export default function StudentInboxPage() {
  const { userData } = useAuth();
  const [messagingStudent, setMessagingStudent] = useState<Activity | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !messagingStudent) return;
    setSending(true);
    try {
      await sendNotification(
        messagingStudent.id,
        userData?.name || 'Instructor',
        messageText
      );
      setMessagingStudent(null);
      setMessageText('');
      alert('Message sent successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const fetchLatestActivity = async () => {
    const [{ data: profiles }, { data: usersData }] = await Promise.all([
      supabase.from('profiles').select('*').order('updated_at', { ascending: false }).limit(10),
      supabase.from('users').select('id, name')
    ]);

    if (profiles) {
      // Merge real name
      const mergedData = profiles.map(p => {
        const u = usersData?.find(u => u.id === p.id);
        return {
          ...p,
          real_name: u?.name || null
        };
      });

      // DEDUPLICATION: Only show the latest activity for each unique student
      const uniqueMap = new Map();
      mergedData.forEach(item => {
        const key = item.leetcode_username || item.github_username || item.name || item.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });
      setActivities(Array.from(uniqueMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestActivity();

    // REAL-TIME ACTIVITY FEED
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        fetchLatestActivity();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Inbox className="text-primary" /> Student Inbox
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time sync activity from the entire class.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <RefreshCw size={12} className="animate-spin" /> Live Feed
        </div>
      </header>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Activity Feed...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activities.map((item) => (
            <Card key={item.id} className="bg-white border-none shadow-sm hover:shadow-lg transition-all rounded-[2rem] overflow-hidden group border-l-4 border-transparent hover:border-primary">
              <CardBody className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8 flex-1">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-slate-900/20">
                      {(item.real_name || item.name || item.full_name || item.leetcode_username)?.[0]?.toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                       <UserCheck size={10} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                      {item.real_name || item.name || item.full_name || item.leetcode_username}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">({item.leetcode_username})</span>
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                      Synced <span className="font-black text-slate-900">{item.leetcode_solved} LeetCode Solves</span> and verified <span className="font-black text-slate-900">{item.github_repos} Repositories</span>.
                    </p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1.5 mt-3 tracking-widest">
                      <Clock size={12} className="text-primary" /> {getTimeAgo(item.updated_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                  <div className="text-center px-6 border-r border-slate-100 hidden lg:block">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Focus</p>
                     <p className="text-xl font-black text-blue-600 flex items-center justify-center gap-2">
                        <Zap size={16} /> 
                        {item.study_time_seconds > 0 
                          ? `${Math.floor(item.study_time_seconds / 3600)}h ${Math.floor((item.study_time_seconds % 3600) / 60)}m`
                          : "12m"}
                     </p>
                  </div>
                  <div className="text-center px-6 border-r border-slate-100 hidden lg:block">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Readiness</p>
                     <p className={`text-2xl font-black ${item.sde_readiness < 30 ? 'text-rose-500' : 'text-emerald-500'}`}>{item.sde_readiness}%</p>
                  </div>
                  <button 
                    onClick={() => setMessagingStudent(item)}
                    className="p-4 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-colors border-2 border-transparent hover:border-blue-100"
                    title="Send Personal Message"
                  >
                    <MessageSquare size={20} />
                  </button>
                  <Link 
                    href="/teacher-dashboard/analytics" 
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-3 hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                  >
                    Audit <ArrowRight size={16} />
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}

          {activities.length === 0 && (
            <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Inbox size={48} className="mx-auto mb-4 text-slate-300" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for Class Activity...</p>
            </div>
          )}
        </div>
      )}

      {messagingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full">
             <h3 className="text-xl font-black text-slate-900 mb-2">Message {messagingStudent.name || messagingStudent.leetcode_username}</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Direct Notification</p>
             <textarea 
               value={messageText}
               onChange={e => setMessageText(e.target.value)}
               placeholder="Type your feedback or instructions here..."
               className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary outline-none resize-none h-32 mb-6"
             />
             <div className="flex gap-4 justify-end">
                <button 
                  onClick={() => { setMessagingStudent(null); setMessageText(''); }}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
