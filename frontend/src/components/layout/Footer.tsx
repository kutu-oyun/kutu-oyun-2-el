'use client';

import Link from 'next/link';
import { Dice5, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
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
              Türkiye'nin en büyük 2. el kutu oyun pazaryeri. Güvenli alışveriş,
              uygun fiyatlar, geniş oyun seçeneği.
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
            <h3 className="font-semibold mb-4">Kategoriler</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/urunler?category=strateji" className="hover:text-white transition-colors">
                  Strateji Oyunları
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=aile" className="hover:text-white transition-colors">
                  Aile Oyunları
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=parti" className="hover:text-white transition-colors">
                  Parti Oyunları
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=kart" className="hover:text-white transition-colors">
                  Kart Oyunları
                </Link>
              </li>
              <li>
                <Link href="/urunler?category=cocuk" className="hover:text-white transition-colors">
                  Çocuk Oyunları
                </Link>
              </li>
              <li>
                <Link href="/urunler" className="hover:text-white transition-colors">
                  Tüm Kategoriler
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">Yardım</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/nasil-calisir" className="hover:text-white transition-colors">
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/guvenli-alisveris" className="hover:text-white transition-colors">
                  Güvenli Alışveriş
                </Link>
              </li>
              <li>
                <Link href="/sss" className="hover:text-white transition-colors">
                  Sık Sorulan Sorular
                </Link>
              </li>
              <li>
                <Link href="/iade-politikasi" className="hover:text-white transition-colors">
                  İade Politikası
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:destek@kutuoyun.com" className="hover:text-white transition-colors">
                  destek@kutuoyun.com
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="font-medium text-sm mb-2">Güvenli Ödeme</h4>
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
          <p>© 2024 KutuOyun. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <Link href="/gizlilik" className="hover:text-white transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
