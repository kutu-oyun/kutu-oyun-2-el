'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Dice5 } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const { signUp, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    try {
      await signUp(formData.email, formData.password, formData.displayName);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanılıyor');
      } else if (err.code === 'auth/invalid-email') {
        setError('Geçersiz e-posta adresi');
      } else if (err.code === 'auth/weak-password') {
        setError('Şifre çok zayıf');
      } else {
        setError('Kayıt olurken bir hata oluştu');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <Card variant="bordered" className="w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center">
              <Dice5 className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--primary)]">KutuOyun</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Hesap Oluştur</h1>
          <p className="text-[var(--muted)]">Hemen ücretsiz üye olun</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg text-[var(--error)] text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Ad Soyad"
            type="text"
            placeholder="Adınız Soyadınız"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            leftIcon={<User className="w-5 h-5" />}
            required
          />

          <Input
            label="E-posta"
            type="email"
            placeholder="ornek@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-5 h-5" />}
            required
          />

          <Input
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            placeholder="En az 6 karakter"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            required
          />

          <Input
            label="Şifre Tekrar"
            type={showPassword ? 'text' : 'password'}
            placeholder="Şifrenizi tekrar girin"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            leftIcon={<Lock className="w-5 h-5" />}
            required
          />

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="rounded border-[var(--border)] mt-1" required />
            <span className="text-[var(--muted)]">
              <Link href="/kullanim-kosullari" className="text-[var(--primary)] hover:underline">
                Kullanım Koşulları
              </Link>
              'nı ve{' '}
              <Link href="/gizlilik" className="text-[var(--primary)] hover:underline">
                Gizlilik Politikası
              </Link>
              'nı okudum, kabul ediyorum.
            </span>
          </label>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Kayıt Ol
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[var(--card)] text-[var(--muted)]">veya</span>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-[var(--muted)]">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-[var(--primary)] font-medium hover:underline">
            Giriş Yap
          </Link>
        </p>
      </Card>
    </div>
  );
}
