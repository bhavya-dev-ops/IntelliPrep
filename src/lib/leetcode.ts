import { supabase } from './supabaseClient';

export interface LeetCodeStats {
  status: string;
  message: string;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  ranking: number;
  contributionPoints: number;
  reputation: number;
}

export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
  try {
    // Calling our internal API proxy to avoid CORS issues
    const response = await fetch(`/api/leetcode?username=${username}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Internal LeetCode Proxy Error:', err);
    return null;
  }
}

export async function saveLeetCodeUsername(userId: string, username: string) {
  const { error } = await supabase
    .from('user_integrations')
    .upsert({ 
      user_id: userId, 
      platform: 'leetcode', 
      username 
    }, { onConflict: 'user_id,platform' });
  
  if (error) throw error;
}

export async function getLeetCodeUsername(userId: string) {
  const { data, error } = await supabase
    .from('user_integrations')
    .select('username')
    .eq('user_id', userId)
    .eq('platform', 'leetcode')
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data?.username || null;
}

export async function verifyRoadmapProgress(userId: string, stats: LeetCodeStats) {
  const verifications = [];

  // Logic: 50+ solved = Basic DSA Verified
  if (stats.totalSolved >= 50) {
    verifications.push({ user_id: userId, topic_name: 'Basic Data Structures', status: 'Verified' });
  }

  // Logic: 20+ Medium = Advanced Algorithms Verified
  if (stats.mediumSolved >= 20) {
    verifications.push({ user_id: userId, topic_name: 'Advanced Algorithms', status: 'Verified' });
  }

  // Logic: 5+ Hard = System Design Foundations Verified
  if (stats.hardSolved >= 5) {
    verifications.push({ user_id: userId, topic_name: 'Complexity Analysis', status: 'Verified' });
  }

  if (verifications.length > 0) {
    const { error } = await supabase
      .from('roadmap_progress')
      .upsert(verifications, { onConflict: 'user_id,topic_name' });
    
    if (error) console.error('Verification Error:', error);
  }
}
