
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import type { ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export default function SignupPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "phone" && !window.recaptchaVerifier && recaptchaContainerRef.current) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [activeTab]);


  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push('/');
    } catch (err: any) {
       setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phone}`, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({ title: t('otpSent'), description: t('checkYourPhone') });
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await window.confirmationResult.confirm(otp);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        router.push('/');
      }
    } catch(err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-background", language === 'ur' ? 'font-urdu' : 'font-body')}>
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('signupTitle')}</CardTitle>
          <CardDescription>
            {t('signupDescription')}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">{t('email')}</TabsTrigger>
                <TabsTrigger value="phone">{t('phone')}</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                <form onSubmit={handleEmailSignup}>
                <CardContent className="grid gap-4 pt-4">
                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                    <div className="grid gap-2">
                    <Label htmlFor="name-email">{t('fullName')}</Label>
                    <Input id="name-email" type="text" placeholder={t('fullName')} required value={name} onChange={(e) => setName(e.target.value)} />
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
            </TabsContent>
            <TabsContent value="phone">
                 {otpSent ? (
                     <form onSubmit={handleVerifyOtp}>
                        <CardContent className="grid gap-4 pt-4">
                             {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                            <div className="grid gap-2">
                                <Label htmlFor="otp">{t('verificationCode')}</Label>
                                <Input id="otp" type="text" placeholder="123456" required value={otp} onChange={(e) => setOtp(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('verifying') : t('verifyAndSignup')}
                            </Button>
                        </CardFooter>
                     </form>
                 ) : (
                    <form onSubmit={handlePhoneSignup}>
                        <CardContent className="grid gap-4 pt-4">
                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                             <div className="grid gap-2">
                                <Label htmlFor="name-phone">{t('fullName')}</Label>
                                <Input id="name-phone" type="text" placeholder={t('fullName')} required value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">{t('phone')}</Label>
                                <Input id="phone" type="tel" placeholder="1234567890" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? t('sendingCode') : t('sendVerificationCode')}
                            </Button>
                        </CardFooter>
                    </form>
                 )}
            </TabsContent>
        </Tabs>
        
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

