import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, LANG_STORAGE_KEY } from './config';

export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const browserLang = navigator.language.split('-')[0] as any;
  if (SUPPORTED_LOCALES.includes(browserLang)) {
    return browserLang;
  }

  return DEFAULT_LOCALE;
}

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LANG_STORAGE_KEY) as Locale;
  return SUPPORTED_LOCALES.includes(stored) ? stored : null;
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANG_STORAGE_KEY, locale);
  }
}

export function getInitialLocale(): Locale {
  const stored = getStoredLocale();
  if (stored) return stored;
  
  return getBrowserLocale();
}

export function resolveKey(obj: any, key: string): string {
  const value = key.split('.').reduce((acc, part) => acc && acc[part], obj);
  return typeof value === 'string' ? value : key;
}
