"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { Logo } from '@/components/ui/Logo';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // We can customize the navItems based on route prefix or user role
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Videos', href: '/dashboard/videos', icon: '📺' },
    { name: 'Materials', href: '/dashboard/materials', icon: '📂' },
    { name: 'Notes', href: '/dashboard/notes', icon: '📝' },
    { name: 'A.I Report', href: '/dashboard/reports', icon: '🤖' },
    { name: 'Placement Sync', href: '/dashboard/leetcode', icon: '🚀' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  const teacherItems = [
    { name: 'Student Analytics', href: '/teacher-dashboard/analytics', icon: '📊' },
    { name: 'Class Performance', href: '/teacher-dashboard/performance', icon: '📈' },
    { name: 'Review Inbox', href: '/teacher-dashboard/reviews', icon: '📥' },
  ];

  const isTeacherRoute = pathname.startsWith('/teacher-dashboard');

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border shadow-sm text-gray-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="py-6 flex flex-col gap-2 px-4 overflow-y-auto h-[calc(100vh-160px)]">
          {!isTeacherRoute ? (
            <>
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Hub</p>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      isActive 
                        ? 'bg-blue-50 text-primary font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    <span>{item.icon}</span> {item.name}
                  </Link>
                );
              })}
            </>
          ) : (
            <div className="">
              <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teacher Portal</p>
              {teacherItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                    }`}
                  >
                    <span>{item.icon}</span> {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button 
            onClick={() => signOut()} 
            className="w-full flex items-center gap-3 text-gray-600 hover:text-red-500 px-4 py-2 transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
