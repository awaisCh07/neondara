
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Language } from '@/lib/translations';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('niondra-lang') as Language | null;
    if (storedLang) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('niondra-lang', lang);
    setLanguageState(lang);
    document.documentElement.lang = lang;
    document.body.className = cn(document.body.className.replace(/font-urdu|font-english/g, ''), lang === 'ur' ? 'font-urdu' : 'font-english');
  };

  useEffect(() => {
    setLanguage(language);
  }, [language]);
  
  const t = useTranslation(language);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
