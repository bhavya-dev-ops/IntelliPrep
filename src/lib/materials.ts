import { supabase } from './supabaseClient';

export interface Material {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
}

export interface WatchHistory {
  id: string;
  watched_at: string;
  progress: number;
  materials: Material;
}

export async function getWatchedVideos(userId: string): Promise<WatchHistory[]> {
  const { data, error } = await supabase
    .from('activity')
    .select(`
      id,
      watched_at,
      progress,
      materials (
        id,
        title,
        url,
        thumbnail_url
      )
    `)
    .eq('user_id', userId)
    .order('watched_at', { ascending: false });

  if (error) {
    console.error('Error fetching watch history:', error);
    return [];
  }

  // Type casting since Supabase return type for joins can be complex
  return data as unknown as WatchHistory[];
}

export async function getAllMaterials(userId: string): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('user_id', userId) // Enforce user_id filter
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  return data || [];
}

export async function recordActivity(userId: string, materialId: string) {
  // 1. Check if already watched to prevent duplicate count increment
  const { data: existing } = await supabase
    .from('activity')
    .select('id')
    .eq('user_id', userId)
    .eq('material_id', materialId)
    .maybeSingle();

  const { error } = await supabase
    .from('activity')
    .insert([{ 
      user_id: userId, 
      material_id: materialId, 
      progress: 100,
      watched_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error recording activity:', error);
    return false;
  }

  // 2. Increment videos_watched_count in profiles if this is the first time watching
  if (!existing) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('videos_watched_count')
      .eq('id', userId)
      .single();
    
    await supabase
      .from('profiles')
      .update({ 
        videos_watched_count: (profile?.videos_watched_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  return true;
}

export async function addMaterial(title: string, url: string, userId: string, thumbnailUrl?: string) {
  const { data, error } = await supabase
    .from('materials')
    .insert([{ 
      title, 
      url, 
      user_id: userId, // Attach the owner
      thumbnail_url: thumbnailUrl || `https://img.youtube.com/vi/${getYouTubeId(url)}/maxresdefault.jpg`
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding material:', error);
    return null;
  }
  return data;
}

// Helper to get YouTube ID for thumbnails
function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
