
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail
} from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function LoginPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError(t('invalidCredentialsError'));
        } else {
            setError(err.message);
        }
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordReset = async () => {
    if (!resetEmail) return;
    setResetLoading(true);

    try {
        await sendPasswordResetEmail(auth, resetEmail);
        toast({
            title: t('passwordResetTitle'),
            description: t('passwordResetDescription'),
        });
        setIsResetDialogOpen(false);
    } catch (err: any) {
        toast({
            title: t('error'),
            description: err.message,
            variant: "destructive",
        })
    } finally {
        setResetLoading(false);
    }
  }

  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-background", language === 'ur' ? 'font-urdu' : 'font-body')}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <CardDescription>
            {t('loginDescription')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
            <CardContent className="grid gap-4 pt-4">
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Button variant="link" type="button" onClick={() => setIsResetDialogOpen(true)} className="p-0 h-auto text-xs">
                    {t('forgotPassword')}
                </Button>
                </div>
                <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('signingIn') : t('signIn')}
            </Button>
            </CardFooter>
        </form>
        
        <div className="mt-4 text-center text-sm pb-6">
            {t('noAccount')}{' '}
            <Link href="/signup" className="underline" prefetch={false}>
            {t('signUp')}
            </Link>
        </div>
      </Card>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('forgotPassword')}</DialogTitle>
            <DialogDescription>
                {t('forgotPasswordDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="reset-email">{t('email')}</Label>
            <Input
              id="reset-email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="your@example.com"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">{t('cancel')}</Button>
            </DialogClose>
            <Button onClick={handlePasswordReset} disabled={resetLoading}>
              {resetLoading ? t('sendingLink') : t('sendResetLink')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
