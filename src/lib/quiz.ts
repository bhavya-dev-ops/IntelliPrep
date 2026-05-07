import { supabase } from './supabaseClient';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  teacher_id: string;
  subject: string;
  topic: string;
  difficulty: string;
  duration_minutes: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_questions: number;
  answers: Record<number, string>;
  created_at: string;
}

export async function createQuiz(quiz: Omit<Quiz, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quizzes')
    .insert([quiz])
    .select();

  let actualData = data;
  if (error) {
    console.warn('Supabase insert failed. Falling back to local storage for Quiz.', error);
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('quizzes_data') || '[]');
      const newQuiz = { ...quiz, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() };
      localStorage.setItem('quizzes_data', JSON.stringify([newQuiz, ...stored]));
      actualData = [newQuiz];
    }
  }
  return actualData;
}

export async function getTeacherQuizzes(teacherId: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  let results = data || [];
  if (error || results.length === 0) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('quizzes_data') || '[]');
      const localMatches = stored.filter((m: any) => m.teacher_id === teacherId);
      if (localMatches.length > 0) results = localMatches;
    }
  }
  return results as Quiz[];
}

export async function getStudentQuizzes(): Promise<Quiz[]> {
  // Normally this would join with assignments, but for now we fetch all quizzes
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  let results = data || [];
  if (error || results.length === 0) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('quizzes_data') || '[]');
      if (stored.length > 0) results = stored;
    }
  }
  return results as Quiz[];
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('quizzes_data') || '[]');
      const match = stored.find((m: any) => m.id === id);
      return match || null;
    }
    return null;
  }
  return data as Quiz;
}

export async function submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([attempt])
    .select();

  let actualData = data;
  if (error) {
    console.warn('Supabase insert failed. Falling back to local storage for Attempt.', error);
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('quiz_attempts_data') || '[]');
      const newAttempt = { ...attempt, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() };
      localStorage.setItem('quiz_attempts_data', JSON.stringify([newAttempt, ...stored]));
      actualData = [newAttempt];
    }
  }
  return actualData;
}

export async function getStudentAttempts(studentId: string): Promise<QuizAttempt[]> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  let results = data || [];
  if (error || results.length === 0) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('quiz_attempts_data') || '[]');
      const localMatches = stored.filter((m: any) => m.student_id === studentId);
      if (localMatches.length > 0) results = localMatches;
    }
  }
  return results as QuizAttempt[];
}
