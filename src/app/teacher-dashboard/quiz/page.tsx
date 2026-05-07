"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { createQuiz, getTeacherQuizzes, Quiz, QuizQuestion } from '@/lib/quiz';
import { Brain, Sparkles, Clock, Check, Eye, Trash2 } from 'lucide-react';

export default function AIQuizGeneratorPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  
  // Generator State
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState('5');
  const [duration, setDuration] = useState('10');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async () => {
    if (!user) return;
    const data = await getTeacherQuizzes(user.id);
    setQuizzes(data);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsGenerating(true);
    setGeneratedQuestions(null);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          count: parseInt(count)
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      
      setGeneratedQuestions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz from AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !generatedQuestions) return;
    try {
      await createQuiz({
        teacher_id: user.id,
        subject,
        topic,
        difficulty,
        duration_minutes: parseInt(duration),
        questions: generatedQuestions
      });
      setGeneratedQuestions(null);
      setSubject('');
      setTopic('');
      alert('Quiz published successfully!');
      loadQuizzes();
    } catch (err) {
      alert('Failed to publish quiz');
    }
  };

  const removeQuestion = (index: number) => {
    if (!generatedQuestions) return;
    const updated = [...generatedQuestions];
    updated.splice(index, 1);
    setGeneratedQuestions(updated);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Brain className="text-purple-600" /> AI Quiz Generator
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Instantly generate high-quality assessments using Groq AI.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Generator Form */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 bg-purple-50/50">
               <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Sparkles className="text-purple-500" size={20} /> Quiz Parameters
               </h2>
            </CardHeader>
            <CardBody className="p-8">
              <form onSubmit={handleGenerate} className="space-y-5">
                {error && (
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Subject</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Operating Systems"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Topic</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Deadlocks"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Difficulty</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      value={difficulty}
                      onChange={e => setDifficulty(e.target.value)}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Count</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      value={count}
                      onChange={e => setCount(e.target.value)}
                    >
                      <option>5</option>
                      <option>10</option>
                      <option>15</option>
                      <option>20</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duration (Minutes)</label>
                  <input 
                    type="number"
                    min="1"
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className="w-full py-4 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {isGenerating ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Generating...</>
                  ) : (
                    <><Sparkles size={16} /> Generate with AI</>
                  )}
                </button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* AI Preview Area */}
        <div className="xl:col-span-2 space-y-6">
          {generatedQuestions ? (
            <Card className="bg-white border-none shadow-xl rounded-[2.5rem] overflow-hidden border-2 border-purple-100">
              <CardHeader className="p-8 border-b border-slate-50 flex justify-between items-center bg-purple-50/30">
                 <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                   <Eye className="text-purple-500" size={20} /> Review & Publish
                 </h2>
                 <button 
                   onClick={handlePublish}
                   className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                 >
                   <Check size={14} /> Publish Quiz
                 </button>
              </CardHeader>
              <CardBody className="p-8 bg-slate-50/50">
                <div className="space-y-6">
                  {generatedQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative group">
                      <button 
                        onClick={() => removeQuestion(idx)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      <h3 className="font-bold text-slate-900 mb-4 pr-10">
                        <span className="text-purple-500 mr-2">{idx + 1}.</span> 
                        {q.question}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`p-3 rounded-xl text-sm font-medium border-2 transition-colors ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <p className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-1">AI Explanation</p>
                        <p className="text-sm text-purple-900/80 font-medium leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                <Brain size={40} className="text-purple-200" />
              </div>
              <h3 className="text-xl font-black text-slate-400 mb-2">Awaiting Parameters</h3>
              <p className="text-slate-400 font-medium max-w-sm">Fill out the generator form to instantly create a personalized quiz tailored to your curriculum.</p>
            </div>
          )}
        </div>
      </div>

      {/* Past Quizzes */}
      <div className="mt-12">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-6">
          <Clock className="text-primary" /> Active Quizzes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <Card key={q.id} className="bg-white border-none shadow-md rounded-3xl hover:shadow-xl transition-shadow cursor-pointer group">
              <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <Brain size={20} />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {q.difficulty}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">{q.subject}</h3>
                <p className="text-slate-500 font-medium text-sm mb-4">{q.topic}</p>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> {q.questions?.length || 0} Qs
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Clock size={12} /> {q.duration_minutes}m
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
          {quizzes.length === 0 && (
            <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No quizzes created yet</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
