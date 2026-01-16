'use client';

import { useState } from 'react';
import { Save, Bell, Lock, Trash2 } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    messages: true,
    orders: true,
  });

  const handleDeleteAccount = () => {
    if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      // Delete account logic
      alert('Hesap silme işlemi için destek ekibiyle iletişime geçin.');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ayarlar</h1>

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
