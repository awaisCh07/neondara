
'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This layout is for the authentication pages (login, signup, verify-email)
// It redirects authenticated and verified users away from these pages.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is logged in AND their email is verified, push them to the main app.
    if (!loading && user && user.emailVerified) {
      router.push('/');
    }
  }, [user, loading, router]);

  // While checking auth, or if a user is found and verified (and we're about to redirect),
  // show a loading screen to prevent flicker and content flash.
  if (loading || (user && user.emailVerified)) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
  }

  // If not loading and no user exists, or user is unverified, it's safe to show the page.
  return <>{children}</>;
}
