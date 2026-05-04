"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { getUserData, UserMetadata } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: UserMetadata | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  liveSeconds: number;
  setLiveSeconds: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userData: null,
  loading: true,
  refreshUserData: async () => {},
  liveSeconds: 0,
  setLiveSeconds: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(0);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function loadData(session: Session | null) {
      if (session?.user) {
        const data = await getUserData(session.user.id);
        if (mounted) {
          setUserData(data);
        }
      } else {
        if (mounted) {
          setUserData(null);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        loadData(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(true);
        loadData(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.id);
      setUserData(data);
    }
  };

  // Route protection logic
  useEffect(() => {
    if (!loading) {
      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
      const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/teacher-dashboard');

      if (!session && isProtectedRoute) {
        router.push('/login');
      } else if (session && isAuthRoute) {
        // Redirect to appropriate dashboard if already logged in
        if (userData?.role === 'teacher') {
          router.push('/teacher-dashboard');
        } else if (userData?.role === 'student') {
          router.push('/dashboard');
        }
      } else if (session && isProtectedRoute && userData) {
        // Prevent student from accessing teacher dashboard and vice versa
        if (pathname.startsWith('/teacher-dashboard') && userData.role !== 'teacher') {
          router.push('/dashboard');
        } else if (pathname.startsWith('/dashboard') && userData.role !== 'student') {
          router.push('/teacher-dashboard');
        }
      }
    }
  }, [loading, session, userData, pathname, router]);

  return (
    <AuthContext.Provider value={{ session, user, userData, loading, refreshUserData, liveSeconds, setLiveSeconds }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
