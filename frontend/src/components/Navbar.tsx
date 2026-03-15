'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, ChefHat, Search, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 mr-6 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                RecipeShare
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/recipes" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[var(--color-surface)] transition-all flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Browse
              </Link>
              <Link href="/search" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-[var(--color-surface)] transition-all flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/recipes/create" className="btn-primary py-2 px-4 shadow-primary-500/20 text-sm hidden sm:block">
                  + Create Recipe
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--color-border)]">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-primary-500/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center border border-primary-500/30">
                        <UserIcon className="w-4 h-4 text-primary-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium hidden md:block">{user.name}</span>
                  </Link>
                  <button onClick={logout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Log out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm shadow-primary-500/20">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
