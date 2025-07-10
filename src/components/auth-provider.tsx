
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const AUTH_ROUTES = ['/login', '/signup'];
const isAuthRoute = (pathname: string) => AUTH_ROUTES.includes(pathname);

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
    // This effect runs only on the client after the initial loading is complete.
    if (loading) return;

    const onAuthRoute = isAuthRoute(pathname);

    // If there's no user and we are not on an authentication page, redirect to login.
    if (!user && !onAuthRoute) {
        router.push('/login');
    }

    // If there is a user and we are on an authentication page, redirect to the home page.
    if(user && onAuthRoute){
        router.push('/');
    }

  }, [user, loading, router, pathname]);

  // While checking for the user, show a loading screen.
  // This prevents rendering protected content on the server prematurely.
  if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
  }
  
  // If we are on a public route, or if we have a user, render the children.
  // Otherwise, the effect above will handle the redirect.
  // We render a fallback "Redirecting..." for the brief moment before the redirect kicks in.
  if (isAuthRoute(pathname) || user) {
     return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Redirecting...</p>
    </div>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
