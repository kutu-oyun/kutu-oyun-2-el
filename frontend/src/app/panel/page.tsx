'use client';

import { useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      await api.auth.updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profil Bilgilerim</h1>

      {/* Profile Photo */}
      <Card variant="bordered">
        <h2 className="font-semibold mb-4">Profil Fotoğrafı</h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || ''}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-[var(--primary)] rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white hover:bg-[var(--primary-hover)] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <p className="text-sm text-[var(--muted)]">
              JPG, GIF veya PNG. Maksimum 2MB.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Fotoğraf Yükle
            </Button>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card variant="bordered">
        <h2 className="font-semibold mb-4">Kişisel Bilgiler</h2>
        
        {success && (
          <div className="mb-4 p-4 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-lg text-[var(--success)] text-sm">
            Profiliniz başarıyla güncellendi!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Ad Soyad"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Adınız Soyadınız"
            />
            <Input
              label="Telefon"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="05XX XXX XX XX"
            />
          </div>
          <Input
            label="E-posta"
            type="email"
            value={user.email}
            disabled
            className="bg-[var(--border)]"
          />
          <p className="text-xs text-[var(--muted)]">
            E-posta adresinizi değiştirmek için destek ekibiyle iletişime geçin.
          </p>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4" />
            Kaydet
          </Button>
        </form>
      </Card>

      {/* Stats */}
      <Card variant="bordered">
        <h2 className="font-semibold mb-4">Hesap İstatistikleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <p className="text-2xl font-bold text-[var(--primary)]">
              {user._count?.products || 0}
            </p>
            <p className="text-sm text-[var(--muted)]">İlan</p>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <p className="text-2xl font-bold text-[var(--primary)]">
              {user._count?.orders || 0}
            </p>
            <p className="text-sm text-[var(--muted)]">Sipariş</p>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <p className="text-2xl font-bold text-[var(--primary)]">
              {user._count?.favorites || 0}
            </p>
            <p className="text-sm text-[var(--muted)]">Favori</p>
          </div>
          <div className="text-center p-4 bg-[var(--background)] rounded-lg">
            <p className="text-2xl font-bold text-[var(--primary)]">
              {new Date(user.createdAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}
            </p>
            <p className="text-sm text-[var(--muted)]">Üyelik</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
