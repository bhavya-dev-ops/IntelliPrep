import { supabase } from './supabaseClient';

export interface GitHubStats {
  username: string;
  publicRepos: number;
  totalGists: number;
  followers: number;
  languages: Record<string, number>;
  topRepos: Array<{
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
  }>;
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats | null> {
  try {
    // 1. Fetch User Data
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userRes.json();

    if (userData.message === 'Not Found' || userData.message?.includes('API rate limit')) return null;

    // 2. Fetch Repos Data
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
    const reposData = await reposRes.json();

    // 3. Process Languages & Top Repos
    const languages: Record<string, number> = {};
    
    // CRASH PROTECTION: Ensure reposData is an array
    const topRepos = Array.isArray(reposData) 
      ? reposData.slice(0, 3).map((repo: any) => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
          return {
            name: repo.name,
            description: repo.description || 'No description provided.',
            stars: repo.stargazers_count,
            language: repo.language || 'Mixed',
            url: repo.html_url
          };
        })
      : [];

    return {
      username: userData.login,
      publicRepos: userData.public_repos || 0,
      totalGists: userData.public_gists || 0,
      followers: userData.followers || 0,
      languages,
      topRepos
    };
  } catch (err) {
    console.error('GitHub API Error:', err);
    return null;
  }
}

export async function savePlacementIntegration(userId: string, platform: 'leetcode' | 'github', username: string, stats: any) {
  try {
    // 1. Update/Insert the specific integration record
    const { error: intError } = await supabase
      .from('user_integrations')
      .upsert({ 
        user_id: userId, 
        platform, 
        username,
        last_synced_data: stats,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,platform' });
    
    if (intError) {
      console.warn('Primary Upsert Failed, attempting insert fallback...', intError);
      // Fallback: If unique constraint is missing, try a basic insert
      await supabase.from('user_integrations').insert({ 
        user_id: userId, 
        platform, 
        username,
        last_synced_data: stats 
      });
    }
  } catch (err) {
    console.error('Integration Logic Error:', err);
  }

  // 2. Sync the holistic Profile
  const updateField = platform === 'leetcode' ? 'leetcode_stats' : 'github_stats';
  await supabase
    .from('profiles')
    .upsert({ 
      id: userId, 
      [updateField]: stats,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
}
