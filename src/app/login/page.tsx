
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  query,
  collection,
  where,
  getDocs
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

export default function LoginPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  const isEmail = (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let userEmail = identifier;

    try {
      if (!isEmail(identifier)) {
        // It's a phone number, we need to find the associated auth email.
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("phone", "==", identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("User with this phone number not found.");
        }
        
        const userData = querySnapshot.docs[0].data();
        userEmail = userData.authEmail; // Use the authEmail for login
      }

      await signInWithEmailAndPassword(auth, userEmail, password);
      router.push('/');
    } catch (err: any) {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            setError("Invalid credentials. Please check your email/phone and password.");
        } else {
            setError(err.message);
        }
    } finally {
      setLoading(false);
    }
  };


  const handlePasswordReset = async () => {
    if (!resetIdentifier) return;
    setResetLoading(true);

    if (isEmail(resetIdentifier)) {
        try {
            await sendPasswordResetEmail(auth, resetIdentifier);
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
    } else {
        // It's a phone number. Standard Firebase Auth password reset via phone is not available on the client.
        // We will inform the user about the limitation.
        toast({
            title: "Password Reset Not Available",
            description: "Password reset is not available for accounts created with a phone number. Please create a new account or contact support.",
            variant: "destructive",
            duration: 9000
        });
        setResetLoading(false);
        setIsResetDialogOpen(false);
    }
  }

  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-background", language === 'ur' ? 'font-urdu' : 'font-body')}>
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
                <Label htmlFor="identifier">{t('email')} / {t('phone')}</Label>
                <Input
                id="identifier"
                type="text"
                placeholder="Email or Phone Number"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                Enter your email to receive a password reset link. If you signed up with a phone number, this feature is not available.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="reset-identifier">{t('email')} / {t('phone')}</Label>
            <Input
              id="reset-identifier"
              type="text"
              value={resetIdentifier}
              onChange={(e) => setResetIdentifier(e.target.value)}
              placeholder="your@example.com or 1234567890"
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
