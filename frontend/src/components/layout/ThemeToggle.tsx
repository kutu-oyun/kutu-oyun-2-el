'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 rounded-lg text-[var(--muted)]"
        aria-hidden
        tabIndex={-1}
      >
        <Sun className="w-5 h-5 opacity-0" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
      aria-label={t('theme.toggle')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
