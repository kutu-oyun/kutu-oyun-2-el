import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header, Footer } from '@/components/layout';

const outfit = Outfit({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'KutuOyun - 2. El Kutu Oyun Pazaryeri',
  description: 'Türkiye\'nin en büyük 2. el kutu oyun pazaryeri. Güvenli alışveriş, uygun fiyatlar, geniş oyun seçeneği.',
  keywords: ['kutu oyunu', '2. el', 'board game', 'pazaryeri', 'satın al', 'sat'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
