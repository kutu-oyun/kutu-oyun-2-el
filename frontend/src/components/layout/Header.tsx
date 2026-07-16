'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAtomValue } from 'jotai';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  MapPin,
  Plus,
  LogOut,
  Package,
  Heart,
  MessageSquare,
  Settings,
  Dice5,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { userAtom, isLoadingAuthAtom } from '@/atoms/auth';
import { cartCountAtom } from '@/atoms/cart';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/i18n';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

const categoryDefs = [
  { key: 'cat.strategy' as const, slug: 'strateji' },
  { key: 'cat.family' as const, slug: 'aile' },
  { key: 'cat.party' as const, slug: 'parti' },
  { key: 'cat.card' as const, slug: 'kart' },
  { key: 'cat.kids' as const, slug: 'cocuk' },
  { key: 'cat.cooperative' as const, slug: 'kooperatif' },
];

export default function Header() {
  const user = useAtomValue(userAtom);
  const isLoading = useAtomValue(isLoadingAuthAtom);
  const cartCount = useAtomValue(cartCountAtom);
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/urunler?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)]">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
              <Dice5 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--primary)] hidden sm:block">
              KutuOyun
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <Input
              type="search"
              placeholder={t('nav.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              className="w-full"
            />
          </form>

          {/* Location (Desktop) */}
          <button className="hidden lg:flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            <MapPin className="w-4 h-4" />
            <span>{t('nav.location')}</span>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />

            {/* Cart */}
            <Link href="/sepet" className="relative p-2 hover:bg-[var(--border)] rounded-lg transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Auth / Profile */}
            {isLoading ? (
              <div className="w-10 h-10 bg-[var(--border)] rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || ''}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                    {user.displayName || t('nav.myAccount')}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute end-0 top-full mt-2 w-56 bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)] py-2 z-20">
                      <div className="px-4 py-2 border-b border-[var(--border)]">
                        <p className="font-medium truncate">{user.displayName || t('nav.user')}</p>
                        <p className="text-sm text-[var(--muted)] truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/panel"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Package className="w-4 h-4" />
                        <span>{t('nav.myListings')}</span>
                      </Link>
                      <Link
                        href="/panel/siparisler"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t('nav.myOrders')}</span>
                      </Link>
                      <Link
                        href="/panel/favoriler"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        <span>{t('nav.myFavorites')}</span>
                      </Link>
                      <Link
                        href="/panel/mesajlar"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t('nav.myMessages')}</span>
                      </Link>
                      <Link
                        href="/panel/ayarlar"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>{t('nav.settings')}</span>
                      </Link>
                      <div className="border-t border-[var(--border)] mt-2 pt-2">
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-[var(--error)] hover:bg-[var(--border)] transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/giris">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                </Button>
              </Link>
            )}

            {/* Sell Button */}
            <Link href="/ilan-olustur" className="hidden sm:block">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                <span>{t('nav.sell')}</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories Bar (Desktop) */}
      <nav className="hidden lg:block border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1">
            <li>
              <Link
                href="/urunler"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:text-[var(--primary)] transition-colors"
              >
                <Menu className="w-4 h-4" />
                {t('nav.allCategories')}
              </Link>
            </li>
            {categoryDefs.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/urunler?category=${cat.slug}`}
                  className="px-4 py-3 text-sm hover:text-[var(--primary)] transition-colors block"
                >
                  {t(cat.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card)]">
          <div className="px-4 py-4 space-y-4">
            {/* Location */}
            <button className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <MapPin className="w-4 h-4" />
              <span>{t('nav.location')}</span>
            </button>

            {/* Categories */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-2">
                {t('nav.categories')}
              </p>
              <Link
                href="/urunler"
                className="block px-3 py-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.allCategories')}
              </Link>
              {categoryDefs.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/urunler?category=${cat.slug}`}
                  className="block px-3 py-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(cat.key)}
                </Link>
              ))}
            </div>

            {/* Sell Button (Mobile) */}
            <Link href="/ilan-olustur" className="block" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">
                <Plus className="w-4 h-4" />
                <span>{t('nav.sellFree')}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
