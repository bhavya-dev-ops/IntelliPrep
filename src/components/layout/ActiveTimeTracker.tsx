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
      // Only count if the tab is actually visible/active
      if (document.visibilityState === 'visible') {
        secondsBuffer.current += 1;
        setLiveSeconds(prev => prev + 1);
      }
    }, 1000);

    // 2. Save to Supabase every 30 seconds
    saveInterval.current = setInterval(async () => {
      if (secondsBuffer.current > 0) {
        const secondsToSave = secondsBuffer.current;
        console.log(`[TimeTracker] Attempting to save ${secondsToSave} seconds...`);
        
        secondsBuffer.current = 0; 

        try {
          // 1. Fetch current time from PROFILES table
          const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('study_time_seconds')
            .eq('id', user.id)
            .single();

          const newTotal = (Number(data?.study_time_seconds) || 0) + secondsToSave;

          // 2. Save new total to PROFILES table using UPSERT
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({ 
              id: user.id, 
              study_time_seconds: newTotal,
              updated_at: new Date().toISOString()
            });

          if (updateError) throw updateError;
          
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
