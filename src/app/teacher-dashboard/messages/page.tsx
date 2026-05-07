"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Send, Clock, UserCheck, CheckCircle2, Circle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSentNotifications } from '@/lib/notifications';

export default function SentMessagesPage() {
  const { userData, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (userData) {
      const teacherName = userData.name || 'Instructor';
      getSentNotifications(teacherName).then(data => {
        setMessages(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [userData, authLoading]);

  return (
    <div className="space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Send className="text-primary" /> Sent Messages History
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Review the direct notifications you have sent to your students.</p>
      </header>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading message history...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map((msg) => (
            <Card key={msg.id} className="bg-white border-none shadow-sm hover:shadow-lg transition-all rounded-[2rem] overflow-hidden group border-l-4 border-transparent hover:border-primary">
              <CardBody className="p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                      <Send size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                          To: {msg.student_name}
                        </span>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${msg.is_read ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {msg.is_read ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                          {msg.is_read ? 'Read by Student' : 'Unread'}
                        </span>
                      </div>
                      <p className="text-slate-700 font-medium text-lg leading-relaxed">{msg.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest md:border-l md:border-slate-100 md:pl-6">
                    <Clock size={12} className="text-primary" /> 
                    {new Date(msg.created_at).toLocaleString('en-GB')}
                  </div>

                </div>
              </CardBody>
            </Card>
          ))}

          {messages.length === 0 && (
            <div className="p-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Send size={48} className="mx-auto mb-4 text-slate-300" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No messages sent yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
