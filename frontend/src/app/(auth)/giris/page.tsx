'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Dice5 } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(formData.email, formData.password);
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('E-posta veya şifre hatalı');
      } else if (err.code === 'auth/user-not-found') {
        setError('Bu e-posta ile kayıtlı kullanıcı bulunamadı');
      } else if (err.code === 'auth/wrong-password') {
        setError('Şifre hatalı');
      } else {
        setError('Giriş yapılırken bir hata oluştu');
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
          <h1 className="text-2xl font-bold mt-6 mb-2">Giriş Yap</h1>
          <p className="text-[var(--muted)]">Hesabınıza giriş yapın</p>
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
            placeholder="••••••••"
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded border-[var(--border)]" />
              <span>Beni hatırla</span>
            </label>
            <Link
              href="/sifremi-unuttum"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Giriş Yap
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

        {/* Register Link */}
        <p className="text-center text-sm text-[var(--muted)]">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="text-[var(--primary)] font-medium hover:underline">
            Kayıt Ol
          </Link>
        </p>
      </Card>
    </div>
  );
}
