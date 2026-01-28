import { headers, cookies } from 'next/headers';
import { Locale, DEFAULT_LOCALE, SUPPORTED_LOCALES, LANG_COOKIE_NAME } from './config';
import { resolveKey } from './client';

import en from './locales/en.json';
import es from './locales/es.json';

const locales = { en, es };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LANG_COOKIE_NAME)?.value as Locale;

  if (storedLocale && SUPPORTED_LOCALES.includes(storedLocale)) {
    return storedLocale;
  }

  const headerList = await headers();
  const acceptLanguage = headerList.get('accept-language');
  
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split('-')[0] as Locale;
    if (SUPPORTED_LOCALES.includes(preferred)) {
      return preferred;
    }
  }

  return DEFAULT_LOCALE;
}

export async function getTranslation() {
  const locale = await getLocale();
  
  return {
    t: (key: string) => resolveKey(locales[locale], key),
    locale
  };
}
