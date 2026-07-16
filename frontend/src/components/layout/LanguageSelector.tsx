'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { LOCALES, localeMeta, useLocale, useTranslation } from '@/i18n';

interface LanguageSelectorProps {
  /** Compact icon button (header) vs full list (settings) */
  variant?: 'compact' | 'list';
}

export default function LanguageSelector({
  variant = 'compact',
}: LanguageSelectorProps) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (variant === 'list') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LOCALES.map((code) => {
          const meta = localeMeta[code];
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                active
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)] hover:bg-[var(--border)]/60'
              }`}
            >
              <span>
                <span className="block font-medium">{meta.nativeLabel}</span>
                <span className="block text-xs text-[var(--muted)]">
                  {meta.label}
                </span>
              </span>
              {active && <Check className="w-4 h-4 text-[var(--primary)] shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
        aria-label={t('lang.select')}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden md:inline text-xs font-medium uppercase tracking-wide">
          {locale}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('lang.select')}
          className="absolute end-0 top-full mt-2 w-48 bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)] py-1 z-30"
        >
          {LOCALES.map((code) => {
            const meta = localeMeta[code];
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'hover:bg-[var(--border)]'
                }`}
              >
                <span>{meta.nativeLabel}</span>
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
