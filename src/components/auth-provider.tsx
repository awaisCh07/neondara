// src/components/auth-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { AppLayout } from './layout';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const PROTECTED_ROUTES = ['/', '/people', '/people/[personId]'];
const PUBLIC_ROUTES = ['/login', '/signup'];

// Helper function to match dynamic routes
const isProtectedRoute = (pathname: string) => {
    if (PROTECTED_ROUTES.includes(pathname)) return true;
    if (pathname.startsWith('/people/')) return true;
    return false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    
    if (!user && isProtectedRoute(pathname)) {
        router.push('/login');
    }

    if(user && isPublicRoute){
        router.push('/');
    }

  }, [user, loading, router, pathname]);

  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      );
  }

  if (!user && isProtectedRoute(pathname)) {
       return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Redirecting to login...</p>
        </div>
      );
  }

  // Render children within layout for protected routes, otherwise just children
  if (user && isProtectedRoute(pathname)) {
       return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
