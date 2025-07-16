
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { sendEmailVerification } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/language-provider';
import { MailCheck, LogIn } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';


export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const router = useRouter();
  
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // If user becomes verified while on the page, redirect them.
  useEffect(() => {
    if (user?.emailVerified) {
      toast({
        title: t('emailVerifiedSuccessTitle'),
        description: t('emailVerifiedSuccessDescription')
      });
      router.push('/');
    }
  }, [user, router, t, toast]);


  const handleResendVerification = async () => {
    if (!user || cooldown > 0) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: t('verificationEmailSentTitle'),
        description: t('verificationEmailSentDescription'),
      });
      
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setCooldown(newRetryCount === 1 ? 30 : 60);

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
  
  const handleGoToLogin = async () => {
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

  if (user?.emailVerified) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>{t('redirecting')}</p>
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
          <Button onClick={handleResendVerification} disabled={isSending || cooldown > 0}>
            {isSending ? t('sending') : (cooldown > 0 ? t('resendCooldown', { seconds: cooldown }) : t('resendVerificationEmail'))}
          </Button>

          <div className="py-4">
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('or')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">{t('alreadyVerifiedPrompt')}</p>
            <Button variant="outline" onClick={handleGoToLogin}>
                <LogIn className="mr-2 h-4 w-4"/>
                {t('goToLogin')}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
