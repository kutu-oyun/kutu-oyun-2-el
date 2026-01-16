'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, CreditCard, Dice5 } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { ProductCard, CategoryCard } from '@/components/features';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';

// Mock data for demo
const mockCategories: Category[] = [
  { id: '1', name: 'Strateji Oyunları', slug: 'strateji', icon: 'chess', _count: { products: 45 } },
  { id: '2', name: 'Aile Oyunları', slug: 'aile', icon: 'users', _count: { products: 38 } },
  { id: '3', name: 'Parti Oyunları', slug: 'parti', icon: 'party-popper', _count: { products: 27 } },
  { id: '4', name: 'Kart Oyunları', slug: 'kart', icon: 'cards', _count: { products: 52 } },
  { id: '5', name: 'Çocuk Oyunları', slug: 'cocuk', icon: 'baby', _count: { products: 31 } },
  { id: '6', name: 'Kooperatif', slug: 'kooperatif', icon: 'handshake', _count: { products: 19 } },
];

const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Catan - Türkçe',
    description: 'Az kullanılmış Catan oyunu',
    price: 450,
    condition: 'VERY_GOOD',
    language: 'TURKISH',
    status: 'ACTIVE',
    location: 'İstanbul, Kadıköy',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: '1',
    seller: { id: '1', displayName: 'Ahmet Y.' },
    categoryId: '1',
    category: { id: '1', name: 'Strateji Oyunları', slug: 'strateji' },
    images: [{ id: '1', url: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400', order: 0 }],
    _count: { favorites: 12, reviews: 3 },
  },
  {
    id: '2',
    title: 'Ticket to Ride Europe',
    description: 'Sıfır gibi durumda',
    price: 680,
    condition: 'LIKE_NEW',
    language: 'ENGLISH',
    status: 'ACTIVE',
    location: 'Ankara, Çankaya',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: '2',
    seller: { id: '2', displayName: 'Mehmet K.' },
    categoryId: '1',
    category: { id: '1', name: 'Strateji Oyunları', slug: 'strateji' },
    images: [{ id: '2', url: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400', order: 0 }],
    _count: { favorites: 8, reviews: 2 },
  },
  {
    id: '3',
    title: 'Azul',
    description: 'Temiz ve eksiksiz',
    price: 320,
    condition: 'GOOD',
    language: 'LANGUAGE_INDEPENDENT',
    status: 'ACTIVE',
    location: 'İzmir, Karşıyaka',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: '3',
    seller: { id: '3', displayName: 'Zeynep A.' },
    categoryId: '2',
    category: { id: '2', name: 'Aile Oyunları', slug: 'aile' },
    images: [{ id: '3', url: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400', order: 0 }],
    _count: { favorites: 15, reviews: 5 },
  },
  {
    id: '4',
    title: 'Codenames - Türkçe',
    description: 'Parti oyunlarının vazgeçilmezi',
    price: 180,
    condition: 'VERY_GOOD',
    language: 'TURKISH',
    status: 'ACTIVE',
    location: 'Bursa, Nilüfer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: '4',
    seller: { id: '4', displayName: 'Can E.' },
    categoryId: '3',
    category: { id: '3', name: 'Parti Oyunları', slug: 'parti' },
    images: [{ id: '4', url: 'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=400', order: 0 }],
    _count: { favorites: 22, reviews: 7 },
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, productsData] = await Promise.all([
          api.categories.list(),
          api.products.featured(),
        ]);
        setCategories(categoriesData as Category[]);
        setFeaturedProducts(productsData as Product[]);
      } catch (error) {
        // Use mock data if API fails
        console.log('Using mock data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--secondary)] to-[#2d2d4a] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-2 border-white rotate-45" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Dice5 className="w-8 h-8 text-[var(--primary)]" />
              <span className="text-[var(--primary)] font-medium">KutuOyun Pazaryeri</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              2. El Kutu Oyunlarının
              <span className="text-[var(--primary)]"> Güvenli Adresi</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Binlerce kutu oyunu keşfet, güvenle al ve sat. Türkiye'nin en büyük 2. el kutu oyun pazaryerinde
              uygun fiyatlarla oyun koleksiyonunu genişlet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/urunler">
                <Button size="lg" className="w-full sm:w-auto">
                  Oyunları Keşfet
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/ilan-olustur">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-[var(--secondary)]">
                  Ücretsiz İlan Ver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Güvenli Alışveriş</h3>
                <p className="text-sm text-[var(--muted)]">iyzico güvencesiyle ödeme yapın</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hızlı Teslimat</h3>
                <p className="text-sm text-[var(--muted)]">Türkiye'nin her yerine kargo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Taksit İmkanı</h3>
                <p className="text-sm text-[var(--muted)]">9 aya varan taksit seçenekleri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Kategoriler</h2>
            <Link href="/urunler" className="text-[var(--primary)] hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Öne Çıkan Ürünler</h2>
            <Link href="/urunler" className="text-[var(--primary)] hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[var(--primary)]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Oyun Koleksiyonunu Sat!
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Evdeki kullanmadığın kutu oyunlarını sat, yeni oyunlar için bütçe oluştur.
            Ücretsiz ilan ver, hemen satışa başla!
          </p>
          <Link href="/ilan-olustur">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-[var(--primary)] hover:bg-gray-100"
            >
              Hemen İlan Ver
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
