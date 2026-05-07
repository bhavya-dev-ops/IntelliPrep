import { supabase } from './supabaseClient';

export interface CGPARecord {
  id: string;
  student_id: string;
  cgpa: number;
  updated_at: string;
}

export async function saveCGPA(studentId: string, cgpa: number) {
  const { data, error } = await supabase
    .from('student_cgpa')
    .upsert({ student_id: studentId, cgpa, updated_at: new Date().toISOString() }, { onConflict: 'student_id' })
    .select();

  if (error) {
    console.warn('Supabase CGPA save failed. Using local storage.', error);
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cgpa_data') || '[]');
      const filtered = stored.filter((c: any) => c.student_id !== studentId);
      const newRecord = { 
        id: Math.random().toString(36).substring(7), 
        student_id: studentId, 
        cgpa, 
        updated_at: new Date().toISOString() 
      };
      localStorage.setItem('cgpa_data', JSON.stringify([...filtered, newRecord]));
      return [newRecord];
    }
  }
  return data;
}

export async function getStudentCGPA(studentId: string): Promise<CGPARecord | null> {
  const { data, error } = await supabase
    .from('student_cgpa')
    .select('*')
    .eq('student_id', studentId)
    .single();

  if (error || !data) {
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem('cgpa_data') || '[]');
      const match = stored.find((c: any) => c.student_id === studentId);
      return match || null;
    }
    return null;
  }
  return data as CGPARecord;
}

export async function getAllCGPAs(): Promise<CGPARecord[]> {
  const { data, error } = await supabase
    .from('student_cgpa')
    .select('*')
    .order('cgpa', { ascending: false });

  if (error || !data || data.length === 0) {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cgpa_data') || '[]');
    }
  }
  return data as CGPARecord[];
}
