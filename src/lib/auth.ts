import { supabase } from './supabaseClient';

export interface UserMetadata {
  id: string;
  name: string;
  role: 'student' | 'teacher';
  study_time_seconds?: number;
}

export async function getUserData(userId: string): Promise<UserMetadata | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Changed from .single() to .maybeSingle()

  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
