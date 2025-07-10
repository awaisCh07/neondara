
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

  // While checking auth, or if a user is found (and we're about to redirect),
  // show a loading screen to prevent flicker and content flash.
  if (loading || user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
  }

  // If not loading and no user exists, it's safe to show the login/signup page.
  return <>{children}</>;
}
