import { supabase } from './supabaseClient';

export interface MarkRecord {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  exam_type: string;
  obtained_marks: number;
  max_marks: number;
  created_at: string;
}

export async function addMark(mark: Omit<MarkRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('marks')
    .insert([mark])
    .select();

  let actualData = data;
  if (error) {
    console.warn('Supabase insert failed. Falling back to local storage.', error);
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('marks_data') || '[]');
      const newMark = { ...mark, id: Math.random().toString(36).substring(7), created_at: new Date().toISOString() };
      localStorage.setItem('marks_data', JSON.stringify([newMark, ...stored]));
      actualData = [newMark];
    }
  }

  return actualData;
}

export async function updateMark(id: string, updates: Partial<MarkRecord>) {
  const { data, error } = await supabase
    .from('marks')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('marks_data') || '[]');
      const updated = stored.map((m: any) => m.id === id ? { ...m, ...updates } : m);
      localStorage.setItem('marks_data', JSON.stringify(updated));
    }
  }
}

export async function deleteMark(id: string) {
  const { error } = await supabase
    .from('marks')
    .delete()
    .eq('id', id);

  if (error) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('marks_data') || '[]');
      const updated = stored.filter((m: any) => m.id !== id);
      localStorage.setItem('marks_data', JSON.stringify(updated));
    }
  }
}

export async function getMarksForStudent(studentId: string): Promise<MarkRecord[]> {
  const { data, error } = await supabase
    .from('marks')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  let results = data || [];
  if (error || results.length === 0) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('marks_data') || '[]');
      const localMatches = stored.filter((m: any) => m.student_id === studentId);
      if (localMatches.length > 0) results = localMatches;
    }
  }

  return results as MarkRecord[];
}

export async function getAllMarksForTeacher(teacherId: string): Promise<MarkRecord[]> {
  const { data, error } = await supabase
    .from('marks')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  let results = data || [];
  if (error || results.length === 0) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('marks_data') || '[]');
      const localMatches = stored.filter((m: any) => m.teacher_id === teacherId);
      if (localMatches.length > 0) results = localMatches;
    }
  }

  return results as MarkRecord[];
}
