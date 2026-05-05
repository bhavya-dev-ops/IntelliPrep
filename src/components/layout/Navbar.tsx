"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { User } from 'lucide-react';

import { Logo } from '@/components/ui/Logo';

export const Navbar: React.FC = () => {
  const { session, userData, loading } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-50 flex items-center justify-between px-6 lg:px-12 shadow-sm">
      <div className="flex items-center">
        <Link href="/" aria-label="Home">
          <Logo className="text-gray-900 dark:text-white" showText={true} />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-md"></div>
        ) : session ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-[0_5px_15px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-all duration-300 border-2 border-white dark:border-gray-800">
                {(userData?.name || 'User')[0].toUpperCase()}
              </div>
              <span className="hidden sm:block font-bold tracking-tight">
                {userData?.name || 'User'}
              </span>
            </Link>
            <Link href={userData?.role === 'teacher' ? "/teacher-dashboard" : "/dashboard"}>
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => signOut()}>
              Logout
            </Button>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
