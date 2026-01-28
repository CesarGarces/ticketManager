export type Locale = 'en' | 'es';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];
export const DEFAULT_LOCALE: Locale = 'en';

export const LANG_STORAGE_KEY = 'app_lang';
export const LANG_COOKIE_NAME = 'NEXT_LOCALE';

export interface Translations {
  [key: string]: string | Translations;
}
