import { supabase } from './supabaseClient';

export type ActivityType = 'video' | 'note' | 'material';

export async function logActivity(userId: string, type: ActivityType) {
  const { error } = await supabase
    .from('activity_logs')
    .insert([{ user_id: userId, activity_type: type }]);
  
  if (error) {
    console.error('Error logging activity:', error);
    return;
  }

  // Increment notes_count in profiles if the activity is a note
  if (type === 'note') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('notes_count')
      .eq('id', userId)
      .single();
    
    await supabase
      .from('profiles')
      .update({ 
        notes_count: (profile?.notes_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }
}

export async function getActivityHeatmapData(userId: string) {
  // Fetch activity logs for the last year
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await supabase
    .from('activity_logs')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', oneYearAgo.toISOString());

  if (error) {
    console.error('Heatmap Data Fetch Error:', error.message, error.details, error.hint);
    return {};
  }

  // Group by date: { '2026-05-01': 5, '2026-05-02': 2 }
  const counts: Record<string, number> = {};
  data.forEach(log => {
    const date = new Date(log.created_at).toISOString().split('T')[0];
    counts[date] = (counts[date] || 0) + 1;
  });

  return counts;
}
