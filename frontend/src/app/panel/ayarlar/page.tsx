'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Save, Bell, Lock, Trash2, Palette, Languages } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/i18n';
import { LanguageSelector } from '@/components/layout';

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    messages: true,
    orders: true,
  });

  useEffect(() => setMounted(true), []);

  const handleDeleteAccount = () => {
    if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      // Delete account logic
      alert('Hesap silme işlemi için destek ekibiyle iletişime geçin.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('nav.settings')}</h1>

      {/* Appearance */}
      <Card variant="bordered">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold">{t('prefs.appearance')}</h2>
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-medium mb-3">{t('prefs.theme')}</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'light', label: t('prefs.themeLight') },
                  { value: 'dark', label: t('prefs.themeDark') },
                  { value: 'system', label: t('prefs.themeSystem') },
                ] as const
              ).map((option) => {
                const active = mounted && theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      active
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                        : 'border-[var(--border)] hover:bg-[var(--border)]/60'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Languages className="w-4 h-4 text-[var(--primary)]" />
              <p className="font-medium">{t('prefs.language')}</p>
            </div>
            <p className="text-sm text-[var(--muted)] mb-3">{t('prefs.languageHint')}</p>
            <LanguageSelector variant="list" />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card variant="bordered">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold">Bildirim Ayarları</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">E-posta Bildirimleri</p>
              <p className="text-sm text-[var(--muted)]">Önemli güncellemeler için e-posta al</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="w-5 h-5 text-[var(--primary)] rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mesaj Bildirimleri</p>
              <p className="text-sm text-[var(--muted)]">Yeni mesajlar için bildirim al</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.messages}
              onChange={(e) => setNotifications({ ...notifications, messages: e.target.checked })}
              className="w-5 h-5 text-[var(--primary)] rounded"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sipariş Bildirimleri</p>
              <p className="text-sm text-[var(--muted)]">Sipariş durumu değişikliklerinde bildir</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.orders}
              onChange={(e) => setNotifications({ ...notifications, orders: e.target.checked })}
              className="w-5 h-5 text-[var(--primary)] rounded"
            />
          </label>
        </div>
        
        <Button className="mt-4">
          <Save className="w-4 h-4" />
          Kaydet
        </Button>
      </Card>

      {/* Security */}
      <Card variant="bordered">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="font-semibold">Güvenlik</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Şifre Değiştir</p>
            <p className="text-sm text-[var(--muted)] mb-4">
              Şifrenizi değiştirmek için e-posta adresinize bir bağlantı göndereceğiz.
            </p>
            <Button variant="outline">Şifre Sıfırlama E-postası Gönder</Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card variant="bordered" className="border-[var(--error)]">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="w-5 h-5 text-[var(--error)]" />
          <h2 className="font-semibold text-[var(--error)]">Tehlikeli Bölge</h2>
        </div>
        
        <p className="text-sm text-[var(--muted)] mb-4">
          Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
        </p>
        
        <Button variant="danger" onClick={handleDeleteAccount}>
          <Trash2 className="w-4 h-4" />
          Hesabımı Sil
        </Button>
      </Card>
    </div>
  );
}
