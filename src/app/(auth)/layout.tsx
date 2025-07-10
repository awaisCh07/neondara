
'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This layout is for the authentication pages (login, signup)
// It redirects authenticated users away from these pages.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // While checking auth, show a loading screen or nothing to prevent flicker
  if (loading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
  }

  // If not loading and no user, show the login/signup page
  return <>{children}</>;
}
