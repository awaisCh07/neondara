
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
      });

      await sendEmailVerification(user);

      toast({
        title: t('verificationEmailSentTitle'),
        description: t('verificationEmailSentDescription'),
      })

      router.push('/verify-email');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
          setError(t('emailInUseError'));
      } else {
       setError(err.message);
      }
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-background", language === 'ur' ? 'font-urdu' : 'font-body')}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
          <CardDescription>
            {t('signupDescription')}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSignup}>
          <CardContent className="grid gap-4 pt-4">
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              <div className="grid gap-2">
                  <Label htmlFor="name">{t('fullName')}</Label>
                  <Input id="name" type="text" placeholder={t('fullName')} required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('creatingAccount') : t('createAccount')}
              </Button>
          </CardFooter>
        </form>
        
        <div className="mt-4 text-center text-sm pb-6">
            {t('haveAccount')}{' '}
            <Link href="/login" className="underline" prefetch={false}>
            {t('logIn')}
            </Link>
        </div>
      </Card>
    </div>
  );
}
