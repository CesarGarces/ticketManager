'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, LANG_COOKIE_NAME } from './config';
import { getInitialLocale, resolveKey, setStoredLocale } from './client';

// Import locales (for simplicity in this abstraction, in a larger app these could be fetched)
import en from './locales/en.json';
import es from './locales/es.json';

const locales = { en, es };

interface TranslationContextType {
  locale: Locale;
  t: (key: string) => string;
  changeLanguage: (locale: Locale) => void;
  isReady: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocale(initialLocale);
    setIsReady(true);
  }, []);

  const t = (key: string): string => {
    return resolveKey(locales[locale], key);
  };

  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    setStoredLocale(newLocale);
    document.cookie = `${LANG_COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <TranslationContext.Provider value={{ locale, t, changeLanguage, isReady }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
