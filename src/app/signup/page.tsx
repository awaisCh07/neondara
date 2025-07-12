
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SignupPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let signupEmail = email;
      const usersRef = collection(db, 'users');
      
      if (activeTab === 'phone') {
        // For phone signup, we check if the phone number is already taken.
        const q = query(usersRef, where("phone", "==", phone));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error("This phone number is already registered.");
        }
        // We create a "dummy" email for Firebase Auth, as it requires an email for password-based accounts.
        signupEmail = `${phone}@neondara.ledger`;
      } else {
         // For email signup, we check if the email is already taken.
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error("This email is already registered.");
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      // Store user details in Firestore
      await setDoc(doc(db, 'users', user.uid), {
          name: name,
          phone: phone || null,
          email: email || null, // The real email, or null for phone signups
          authEmail: user.email // The email used for Firebase auth (could be dummy)
      });

      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        if (activeTab === 'phone') {
          setError("This phone number is already associated with an account.");
        } else {
          setError("This email is already registered.");
        }
      } else {
       setError(err.message);
      }
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className={cn("flex items-center justify-center min-h-screen bg-background", language === 'ur' ? 'font-urdu' : 'font-body')}>
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
            <form onSubmit={handleSignup}>
                <TabsContent value="email">
                    <CardContent className="grid gap-4 pt-4">
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        <div className="grid gap-2">
                            <Label htmlFor="name-email">{t('fullName')}</Label>
                            <Input id="name-email" type="text" placeholder={t('fullName')} required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('email')}</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required={activeTab === 'email'} value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="password-email">{t('password')}</Label>
                            <Input id="password-email" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                </TabsContent>
                 <TabsContent value="phone">
                     <CardContent className="grid gap-4 pt-4">
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        <div className="grid gap-2">
                            <Label htmlFor="name-phone">{t('fullName')}</Label>
                            <Input id="name-phone" type="text" placeholder={t('fullName')} required value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">{t('phone')}</Label>
                            <Input id="phone" type="tel" placeholder="1234567890" required={activeTab === 'phone'} value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password-phone">{t('password')}</Label>
                            <Input id="password-phone" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                    </CardContent>
                </TabsContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? t('creatingAccount') : t('createAccount')}
                    </Button>
                </CardFooter>
            </form>
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
