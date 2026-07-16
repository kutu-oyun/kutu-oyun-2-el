export const LOCALES = ['tr', 'en', 'de', 'fr', 'es', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'tr';

export const LOCALE_STORAGE_KEY = 'kutuly-locale';

export const localeMeta: Record<
  Locale,
  { label: string; nativeLabel: string; dir: 'ltr' | 'rtl' }
> = {
  tr: { label: 'Turkish', nativeLabel: 'Türkçe', dir: 'ltr' },
  en: { label: 'English', nativeLabel: 'English', dir: 'ltr' },
  de: { label: 'German', nativeLabel: 'Deutsch', dir: 'ltr' },
  fr: { label: 'French', nativeLabel: 'Français', dir: 'ltr' },
  es: { label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' },
  ar: { label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
