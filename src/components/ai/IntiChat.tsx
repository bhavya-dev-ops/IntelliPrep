"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Cpu, User, Bot, Zap, Expand, Minimize2, Trash2, Copy, CheckCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'inti';
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "How to prepare for SDE-1?",
  "Review my resume formatting",
  "Explain Dynamic Programming"
];

export default function IntiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hi! I'm **Inti**, your AI Career Assistant. \n\nHow can I help you accelerate your SDE-1 journey today?\n- Need resume tips?\n- Practice coding problems?\n- Clarify complex topics?", 
      sender: 'inti', 
      timestamp: new Date() 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text
          })).concat({ role: 'user', content: text })
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const intiMsg: Message = {
        id: Date.now().toString() + '1',
        text: data.text,
        sender: 'inti',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, intiMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMsg: Message = {
        id: Date.now().toString() + 'err',
        text: "I'm having trouble connecting to my logic core. Please check your connection or try again later.",
        sender: 'inti',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([{ 
      id: Date.now().toString(), 
      text: "Chat cleared. What would you like to discuss next?", 
      sender: 'inti', 
      timestamp: new Date() 
    }]);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
  };

  const containerClasses = isFullscreen 
    ? "fixed inset-4 md:inset-8 z-[100] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300"
    : "fixed bottom-24 right-4 md:right-8 z-[100] w-[calc(100vw-32px)] md:w-[420px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-all duration-300";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={containerClasses}
          >
            {/* CHAT HEADER */}
            <div className="bg-slate-900 dark:bg-slate-950 p-4 md:p-6 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ 
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/40 relative"
                >
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Cpu size={20} />
                  </motion.div>
                  <div className="absolute inset-0 bg-blue-400 blur-lg opacity-20 animate-pulse"></div>
                </motion.div>
                <div>
                  <h3 className="text-white font-black text-sm md:text-base leading-none">Inti AI Dashboard</h3>
                  <p className="text-blue-400 text-[10px] font-bold uppercase mt-1 tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={clearChat} className="p-2 text-slate-400 hover:text-rose-400 transition-colors" title="Clear Chat">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-slate-400 hover:text-white transition-colors hidden md:block" title={isFullscreen ? "Minimize" : "Expand"}>
                  {isFullscreen ? <Minimize2 size={18} /> : <Expand size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MESSAGES AREA */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[80%]`}>
                    <div className={`p-4 md:p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm relative group ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                    }`}>
                      {msg.sender === 'inti' && (
                        <button 
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="absolute -top-3 -right-3 p-2 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {copiedId === msg.id ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      )}
                      
                      {msg.sender === 'user' ? (
                        <span className="whitespace-pre-wrap">{msg.text}</span>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:rounded-xl prose-pre:border prose-pre:border-slate-700 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-3xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* INPUT AREA */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 shrink-0 space-y-3">
              {messages.length < 3 && !isTyping && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleSend(prompt)}
                      className="whitespace-nowrap px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 rounded-xl text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask Inti anything..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 pr-14 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-blue-600 dark:to-indigo-600 text-white rounded-[2rem] shadow-[0_10px_30px_rgba(15,23,42,0.3)] dark:shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center relative overflow-hidden group border-2 border-white dark:border-slate-800"
        >
          {isOpen ? <X size={24} /> : (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Cpu size={26} className="text-blue-400 dark:text-white" />
            </motion.div>
          )}
          {!isOpen && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full animate-pulse"></div>
          )}
        </motion.button>
      </div>
    </>
  );
}
