"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { getStudentQuizzes, Quiz, submitQuizAttempt, getStudentAttempts, QuizAttempt } from '@/lib/quiz';
import { Brain, Clock, Check, ChevronRight, ChevronLeft, Award, Play } from 'lucide-react';

export default function StudentQuizPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  
  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result State
  const [result, setResult] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeQuiz && timeLeft > 0 && !result) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft, result]);

  const loadData = async () => {
    if (!user) return;
    const [qData, aData] = await Promise.all([
      getStudentQuizzes(),
      getStudentAttempts(user.id)
    ]);
    setQuizzes(qData);
    setAttempts(aData);
  };

  const startQuiz = (quiz: Quiz) => {
    // Check if already attempted (optional, but good practice)
    if (attempts.some(a => a.quiz_id === quiz.id)) {
      alert("You have already completed this quiz.");
      return;
    }

    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setTimeLeft(quiz.duration_minutes * 60);
    setResult(null);
  };

  const selectAnswer = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: option
    }));
  };

  const handleSubmit = async () => {
    if (!activeQuiz || !user || isSubmitting) return;
    setIsSubmitting(true);

    // Calculate score
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) score++;
    });

    try {
      const attemptData = {
        quiz_id: activeQuiz.id,
        student_id: user.id,
        score,
        total_questions: activeQuiz.questions.length,
        answers
      };
      
      await submitQuizAttempt(attemptData);
      
      // We don't clear activeQuiz yet so they can see the review
      setResult({ ...attemptData, id: 'temp', created_at: new Date().toISOString() });
      loadData(); // refresh attempts
    } catch (err) {
      alert('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (activeQuiz) {
    if (result) {
      // Review Screen
      const percentage = Math.round((result.score / result.total_questions) * 100);
      return (
        <div className="space-y-8 pb-20 max-w-4xl mx-auto">
          <div className="text-center space-y-4 pt-12">
            <div className="w-32 h-32 mx-auto bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center border-8 border-white shadow-2xl">
              <Award size={64} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Quiz Complete!</h1>
            <p className="text-xl font-bold text-slate-500">You scored {result.score} out of {result.total_questions} ({percentage}%)</p>
            <button 
              onClick={() => { setActiveQuiz(null); setResult(null); }}
              className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 px-4">Detailed Review</h2>
            {activeQuiz.questions.map((q, idx) => {
              const studentAnswer = result.answers[idx];
              const isCorrect = studentAnswer === q.correctAnswer;
              
              return (
                <Card key={idx} className={`border-none shadow-md rounded-[2rem] overflow-hidden border-2 ${isCorrect ? 'border-emerald-100' : 'border-rose-100'}`}>
                  <CardBody className={`p-8 ${isCorrect ? 'bg-emerald-50/30' : 'bg-rose-50/30'}`}>
                    <h3 className="font-bold text-slate-900 mb-6 flex items-start gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shrink-0 mt-0.5 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {idx + 1}
                      </span> 
                      {q.question}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 pl-9">
                      {q.options.map((opt, i) => {
                        let btnStyle = "bg-white border-slate-100 text-slate-600";
                        if (opt === q.correctAnswer) btnStyle = "bg-emerald-100 border-emerald-200 text-emerald-800 ring-2 ring-emerald-500";
                        else if (opt === studentAnswer && !isCorrect) btnStyle = "bg-rose-100 border-rose-200 text-rose-800";

                        return (
                          <div key={i} className={`p-4 rounded-xl text-sm font-bold border-2 ${btnStyle}`}>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                    <div className="pl-9">
                      <div className="p-4 bg-white/60 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Explanation</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    // Active Taking Screen
    const question = activeQuiz.questions[currentQuestionIdx];
    const isLast = currentQuestionIdx === activeQuiz.questions.length - 1;
    const progress = ((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto pb-24 md:pb-20 relative">
        <header className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md pt-4 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{activeQuiz.topic}</h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">{activeQuiz.subject}</p>
          </div>
          <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl shadow-sm w-full sm:w-auto text-center ${timeLeft < 60 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-white text-slate-700'}`}>
            <Clock className="inline mr-2" size={20} /> {formatTime(timeLeft)}
          </div>
        </header>

        {/* Progress Bar */}
        <div className="sticky top-[88px] sm:top-[76px] z-30 h-2 w-full bg-slate-200 rounded-full mb-8 overflow-hidden shadow-inner">
           <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        <Card className="bg-white border-none shadow-xl sm:shadow-2xl rounded-3xl sm:rounded-[2.5rem] overflow-hidden mb-8">
          <CardBody className="p-6 sm:p-10 lg:p-16">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-8 sm:mb-10 leading-relaxed">
               <span className="text-primary mr-3 sm:mr-4">{currentQuestionIdx + 1}.</span> 
               {question.question}
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(opt)}
                  className={`w-full text-left p-4 sm:p-6 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold border-2 transition-all active:scale-[0.98] ${answers[currentQuestionIdx] === opt ? 'bg-blue-50 border-primary text-primary ring-4 ring-primary/20' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100 hover:border-slate-200'}`}
                >
                  <span className="inline-block w-6 sm:w-8 text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 fixed sm:static bottom-0 left-0 right-0 p-4 sm:p-0 bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-100 z-50">
           <button 
             onClick={() => setCurrentQuestionIdx(p => Math.max(0, p - 1))}
             disabled={currentQuestionIdx === 0}
             className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-full font-black text-sm uppercase tracking-widest text-slate-500 hover:bg-slate-200 bg-slate-100 sm:bg-transparent disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
           >
             <ChevronLeft size={16} /> Previous
           </button>

           {isLast ? (
             <button 
               onClick={handleSubmit}
               disabled={isSubmitting || Object.keys(answers).length < activeQuiz.questions.length}
               className="w-full sm:w-auto px-10 py-4 rounded-xl sm:rounded-full bg-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
             >
               {isSubmitting ? 'Submitting...' : 'Submit Quiz'} <Check size={16} />
             </button>
           ) : (
             <button 
               onClick={() => setCurrentQuestionIdx(p => Math.min(activeQuiz.questions.length - 1, p + 1))}
               className="w-full sm:w-auto px-10 py-4 rounded-xl sm:rounded-full bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
             >
               Next <ChevronRight size={16} />
             </button>
           )}
        </div>
      </div>
    );
  }

  // Dashboard List View
  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Brain className="text-primary" /> My Quizzes
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Test your knowledge with AI-generated assessments.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(q => {
          const attempt = attempts.find(a => a.quiz_id === q.id);
          
          return (
            <Card key={q.id} className="bg-white border-none shadow-md rounded-3xl hover:shadow-xl transition-shadow group flex flex-col h-full">
              <CardBody className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Brain size={24} />
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                    {q.difficulty}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-black text-slate-900 text-xl mb-2">{q.topic}</h3>
                  <p className="text-slate-500 font-bold text-sm mb-6 uppercase tracking-widest">{q.subject}</p>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</span>
                    <span className="font-bold text-slate-900">{q.questions?.length || 0}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                    <span className="font-bold text-slate-900">{q.duration_minutes}m</span>
                  </div>
                </div>

                {attempt ? (
                  <div className="w-full py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-100">
                    <Award size={16} className="text-emerald-500" /> Score: {attempt.score}/{attempt.total_questions}
                  </div>
                ) : (
                  <button 
                    onClick={() => startQuiz(q)}
                    className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={16} /> Start Quiz
                  </button>
                )}
              </CardBody>
            </Card>
          );
        })}

        {quizzes.length === 0 && (
          <div className="col-span-full p-16 text-center border-4 border-dashed border-slate-100 rounded-[3rem] bg-white">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-400 mb-2">No Quizzes Assigned</h3>
            <p className="text-slate-400 font-medium">Your teachers haven't assigned any quizzes to you yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
