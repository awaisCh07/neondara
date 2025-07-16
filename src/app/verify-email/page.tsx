
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';
import { MailCheck } from 'lucide-react';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  // If user is verified, redirect them to the home page.
  if (user?.emailVerified) {
    router.push('/');
    return null; // or a loading spinner
  }

  const handleResendVerification = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: t('verificationEmailSentTitle'),
        description: t('verificationEmailSentDescription'),
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSignOut = async () => {
      await auth.signOut();
      router.push('/login');
  }

  if (authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
  }

  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-background p-4", language === 'ur' ? 'font-urdu' : 'font-body')}>
       <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
                <MailCheck className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl">{t('verifyEmailTitle')}</CardTitle>
          <CardDescription>
            {t('verifyEmailDescription', { email: user?.email || t('yourEmail') })}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-sm">
                {t('verifyEmailInstructions')}
            </p>
          <Button onClick={handleResendVerification} disabled={isSending}>
            {isSending ? t('sending') : t('resendVerificationEmail')}
          </Button>
          <div className="text-sm">
            <p>
                {t('wrongAccount')}{' '}
                <Link href="/login" className="underline" onClick={handleSignOut}>
                    {t('logInWithDifferentAccount')}
                </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
