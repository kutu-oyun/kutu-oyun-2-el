'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Heart,
  MessageSquare,
  Settings,
  User,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { href: '/panel', icon: User, label: 'Profil' },
  { href: '/panel/ilanlarim', icon: Package, label: 'İlanlarım' },
  { href: '/panel/siparislerim', icon: ShoppingCart, label: 'Siparişlerim' },
  { href: '/panel/satislarim', icon: TrendingUp, label: 'Satışlarım' },
  { href: '/panel/favorilerim', icon: Heart, label: 'Favorilerim' },
  { href: '/panel/mesajlar', icon: MessageSquare, label: 'Mesajlar' },
  { href: '/panel/ayarlar', icon: Settings, label: 'Ayarlar' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/giris');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <Card variant="bordered" padding="sm" className="sticky top-24">
            {/* User Info */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || ''}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {user.displayName || 'Kullanıcı'}
                  </p>
                  <p className="text-sm text-[var(--muted)] truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* New Listing Button */}
            <div className="p-4 border-b border-[var(--border)]">
              <Link href="/ilan-olustur">
                <Button className="w-full">
                  <Plus className="w-4 h-4" />
                  Yeni İlan
                </Button>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'hover:bg-[var(--border)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
