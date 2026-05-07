"use client";

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';

export function ActiveTimeTracker() {
  const { user, refreshUserData, setLiveSeconds } = useAuth();
  const secondsBuffer = useRef(0);
  const saveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Increment local buffer AND live display every second
    const timer = setInterval(() => {
      // We've relaxed the visibility check to count time as long as the dashboard is open.
      // This ensures that when students are watching YouTube videos in another tab,
      // or taking notes, their time is still accurately recorded.
      secondsBuffer.current += 1;
      setLiveSeconds(prev => prev + 1);
    }, 1000);

    // 2. Save to Supabase every 30 seconds
    saveInterval.current = setInterval(async () => {
      if (secondsBuffer.current > 0) {
        const secondsToSave = secondsBuffer.current;
        console.log(`[TimeTracker] Attempting to save ${secondsToSave} seconds...`);
        
        secondsBuffer.current = 0; 

        try {
          // 1. Fetch current time from USERS table (matching auth.ts and dashboard)
          const { data, error: fetchError } = await supabase
            .from('users')
            .select('study_time_seconds')
            .eq('id', user.id)
            .single();

          const newTotal = (Number(data?.study_time_seconds) || 0) + secondsToSave;

          // 2. Save new total to BOTH tables to ensure consistency
          // Student Dashboard reads from 'users', Teacher Dashboard reads from 'profiles'
          const [res1, res2] = await Promise.all([
            supabase.from('users').update({ study_time_seconds: newTotal }).eq('id', user.id),
            supabase.from('profiles').update({ study_time_seconds: newTotal }).eq('id', user.id)
          ]);

          if (res1.error) throw res1.error;
          
          console.log(`[TimeTracker] Successfully saved! Total: ${newTotal}s`);
          
          // 3. Trigger a refresh of user data so Dashboard updates
          await refreshUserData();
          
          // 4. Reset live seconds now that they are saved in the DB
          setLiveSeconds(0);
        } catch (err) {
          console.error('[TimeTracker] Error saving time:', err);
          // Put seconds back in buffer if it failed
          secondsBuffer.current += secondsToSave;
        }
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [user]);

  return null; // This component stays hidden
}
