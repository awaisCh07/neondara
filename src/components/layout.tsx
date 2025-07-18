
'use client';

import { useAuth } from './auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User as UserIcon, Users, Home as HomeIcon, Languages, Download, Menu, Receipt } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { useLanguage } from './language-provider';
import React, { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until auth state is determined

    // If no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }
    
    // If user exists but email is not verified, redirect to verify-email page
    // unless they are already on it.
    if (!user.emailVerified) {
        if (pathname !== '/verify-email') {
             router.push('/verify-email');
        }
        return;
    }

  }, [user, loading, router, pathname]);


  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '?';
  };
  
  const navItems = [
      { href: '/', label: t('navHistory'), icon: HomeIcon },
      { href: '/people', label: t('navPeople'), icon: Users },
      { href: '/shared-bills', label: t('sharedBills'), icon: Receipt },
  ];

  // If loading, or if the user is not logged in, or if the user's email is not verified,
  // show a loading screen to prevent content flashing before redirection.
  if (loading || !user || !user.emailVerified) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <p>Loading...</p>
        </div>
      );
  }

  return (
    <div className={cn("min-h-screen bg-background", language === 'ur' ? 'font-urdu' : 'font-body')}>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
                <h1 className="text-3xl font-headline text-foreground">{t('appTitle')}</h1>
                <nav className="hidden md:flex items-center gap-4">
                    {navItems.map(item => (
                         <Link key={item.href} href={item.href} passHref>
                            <Button variant="ghost" className={cn(
                                "text-sm font-medium",
                                pathname === item.href ? "text-primary" : "text-muted-foreground",
                                language === 'ur' && 'text-lg'
                            )}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Mobile Menu */}
               <Sheet>
                 <SheetTrigger asChild>
                   <Button variant="ghost" size="icon" className="md:hidden">
                     <Menu className="h-6 w-6" />
                     <span className="sr-only">Open menu</span>
                   </Button>
                 </SheetTrigger>
                 <SheetContent side="left" className="w-full max-w-xs">
                    <SheetHeader>
                        <SheetTitle className="text-left font-headline text-2xl mb-4">{t('appTitle')}</SheetTitle>
                    </SheetHeader>
                   <nav className="flex flex-col gap-4">
                     {navItems.map(item => (
                       <SheetClose asChild key={item.href}>
                         <Link href={item.href} passHref>
                           <Button variant={pathname === item.href ? "secondary" : "ghost"} className={cn(
                             "w-full justify-start text-base",
                             language === 'ur' && 'text-lg'
                           )}>
                             <item.icon className="mr-2 h-5 w-5" />
                             {item.label}
                           </Button>
                         </Link>
                       </SheetClose>
                     ))}
                   </nav>
                 </SheetContent>
               </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                       <AvatarFallback>{getInitials(user?.displayName, user?.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                   <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.displayName || t('myAccount')}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Languages className="mr-2 h-4 w-4" />
                      <span>{t('language')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'ur')}>
                                <DropdownMenuRadioItem value="en">{t('english')}</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="ur">{t('urdu')}</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
       <main>
        {children}
       </main>
    </div>
  );
}
