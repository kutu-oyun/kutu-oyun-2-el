'use client';

import Link from 'next/link';
import { Dice5, Facebook, Twitter, Instagram, Mail } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-[var(--secondary)] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                <Dice5 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">KutuOyun</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[var(--primary)] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/urunler?category=strateji" className="hover:text-white transition-colors">
                  {t('footer.cat.strategy')}
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=aile" className="hover:text-white transition-colors">
                  {t('footer.cat.family')}
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=parti" className="hover:text-white transition-colors">
                  {t('footer.cat.party')}
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=kart" className="hover:text-white transition-colors">
                  {t('footer.cat.card')}
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=cocuk" className="hover:text-white transition-colors">
                  {t('footer.cat.kids')}
                </Link>
              </li>
              <li>
                <Link href="/urunler" className="hover:text-white transition-colors">
                  {t('footer.cat.all')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.help')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/nasil-calisir" className="hover:text-white transition-colors">
                  {t('footer.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/guvenli-alisveris" className="hover:text-white transition-colors">
                  {t('footer.safeShopping')}
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-white transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/iade-politikasi" className="hover:text-white transition-colors">
                  {t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-white transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contactTitle')}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:destek@kutuoyun.com" className="hover:text-white transition-colors">
                  destek@kutuoyun.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium text-sm mb-2">{t('footer.securePayment')}</h4>
              <div className="flex items-center gap-2">
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs">
                  iyzico
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs">
                  VISA
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs">
                  MC
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p>{t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <Link href="/gizlilik" className="hover:text-white transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
