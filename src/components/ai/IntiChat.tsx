"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Cpu, User, Bot, Zap } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'inti';
  timestamp: Date;
}

export default function IntiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hi! I'm Inti, your AI Career Assistant. How can I help you accelerate your SDE-1 journey today?", 
      sender: 'inti', 
      timestamp: new Date() 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // SIMULATED AI LOGIC (Inti's Brain)
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      
      const RESPONSE_POOLS = {
        leetcode: [
          "Your LeetCode stats are looking good, but I recommend focusing on 'Sliding Window' patterns today. It's a top-tier interview favorite.",
          "Consistency is key! Even if you solve just 1 Medium problem today, it keeps your momentum alive.",
          "I've audited your logic DNA. You should try solving 'Number of Islands' to strengthen your DFS understanding.",
          "Recruiters love seeing a high Medium/Hard ratio. Try pushing yourself beyond Easy problems this week!"
        ],
        github: [
          "Your commit history is professional. Try adding a detailed 'System Architecture' section to your top repository's README.",
          "Recruiters love documentation. Make sure your latest MERN project has a clear setup guide and API documentation.",
          "I see you haven't committed in 2 days. A small update to your personal portfolio will keep your GitHub heatmap glowing!",
          "Quality over quantity! Ensure your latest 3 repos have clean code and meaningful commit messages."
        ],
        placement: [
          "Product companies are currently hiring for Backend roles. I suggest spending 30 minutes on 'Low Level Design' (LLD) today.",
          "Your SDE-1 Readiness is trending up. Aim for 85% to unlock the 'Top Tier' referral tier in my analytics.",
          "Placement season is approaching. It's time to start refining your 'Impact Statements' for your resume.",
          "I recommend practicing 'Mock Interviews' with a friend. Your technical logic is solid, now we need to polish your communication."
        ],
        general: [
          "I'm currently auditing your entire SDE-1 profile. You're making excellent progress compared to the class average!",
          "Let's focus on one goal today: Complete one high-impact task and sync your progress. I'm here to track it.",
          "Great to see you active! Remember, a 1% daily improvement leads to a 37x improvement in a year.",
          "I've identified a small gap in your System Design knowledge. Shall I suggest some materials from your Skill Repository?",
          "How's the focus today? I'm ready to audit any new commits or solves you've completed."
        ]
      };

      let pool = RESPONSE_POOLS.general;
      if (lowerInput.includes('leetcode') || lowerInput.includes('logic') || lowerInput.includes('solve')) {
        pool = RESPONSE_POOLS.leetcode;
      } else if (lowerInput.includes('github') || lowerInput.includes('repo') || lowerInput.includes('commit') || lowerInput.includes('project')) {
        pool = RESPONSE_POOLS.github;
      } else if (lowerInput.includes('placement') || lowerInput.includes('job') || lowerInput.includes('career') || lowerInput.includes('interview')) {
        pool = RESPONSE_POOLS.placement;
      }

      const randomResponse = pool[Math.floor(Math.random() * pool.length)];

      const intiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'inti',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, intiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-6 w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* CHAT HEADER */}
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/40 relative"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Cpu size={20} />
                  </motion.div>
                  <div className="absolute inset-0 bg-blue-400 blur-lg opacity-20 animate-pulse"></div>
                </motion.div>
                <div>
                  <h3 className="text-white font-black text-sm leading-none">Inti AI</h3>
                  <p className="text-blue-400 text-[10px] font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES AREA */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Inti anything..."
                  className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 pr-14 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="absolute right-2 p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all disabled:opacity-20 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 text-white rounded-3xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <X size={24} /> : (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Cpu size={24} className="text-blue-400" />
          </motion.div>
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-4 border-white rounded-full"></div>
        )}
      </motion.button>
    </div>
  );
}
