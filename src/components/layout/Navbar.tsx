"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';

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
            <span className="text-sm text-gray-700 hidden sm:block">
              {userData?.name || session.user.email} ({userData?.role || 'user'})
            </span>
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
