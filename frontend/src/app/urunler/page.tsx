'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid, List, ChevronDown } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { ProductCard, FilterSidebar } from '@/components/features';
import { api } from '@/lib/api';
import type { Product, Category } from '@/types';

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Strateji Oyunları', slug: 'strateji', icon: 'chess', _count: { products: 45 } },
  { id: '2', name: 'Aile Oyunları', slug: 'aile', icon: 'users', _count: { products: 38 } },
  { id: '3', name: 'Parti Oyunları', slug: 'parti', icon: 'party-popper', _count: { products: 27 } },
  { id: '4', name: 'Kart Oyunları', slug: 'kart', icon: 'cards', _count: { products: 52 } },
  { id: '5', name: 'Çocuk Oyunları', slug: 'cocuk', icon: 'baby', _count: { products: 31 } },
  { id: '6', name: 'Kooperatif Oyunları', slug: 'kooperatif', icon: 'handshake', _count: { products: 19 } },
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
  {
    id: '5',
    title: 'Wingspan - İngilizce',
    description: 'Kuş temalı strateji oyunu',
    price: 750,
    condition: 'LIKE_NEW',
    language: 'ENGLISH',
    status: 'ACTIVE',
    location: 'İstanbul, Beşiktaş',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: '5',
    seller: { id: '5', displayName: 'Deniz T.' },
    categoryId: '1',
    category: { id: '1', name: 'Strateji Oyunları', slug: 'strateji' },
    images: [{ id: '5', url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400', order: 0 }],
    _count: { favorites: 18, reviews: 4 },
  },
  {
    id: '6',
    title: 'Dixit',
    description: 'Hayal gücü oyunu, çok temiz',
    price: 290,
    condition: 'VERY_GOOD',
    language: 'TURKISH',
    status: 'ACTIVE',
    location: 'Antalya, Muratpaşa',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sellerId: '6',
    seller: { id: '6', displayName: 'Elif S.' },
    categoryId: '3',
    category: { id: '3', name: 'Parti Oyunları', slug: 'parti' },
    images: [{ id: '6', url: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400', order: 0 }],
    _count: { favorites: 25, reviews: 6 },
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const search = searchParams.get('search');
  const category = searchParams.get('category');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;

        const [productsData, categoriesData] = await Promise.all([
          api.products.list(params),
          api.categories.list(),
        ]);

        setProducts((productsData as any).products || mockProducts);
        setCategories(categoriesData as Category[]);
      } catch (error) {
        console.log('Using mock data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams, sortBy, sortOrder]);

  const sortOptions = [
    { label: 'En Yeni', value: 'createdAt', order: 'desc' as const },
    { label: 'En Eski', value: 'createdAt', order: 'asc' as const },
    { label: 'Fiyat (Düşük-Yüksek)', value: 'price', order: 'asc' as const },
    { label: 'Fiyat (Yüksek-Düşük)', value: 'price', order: 'desc' as const },
  ];

  const currentSort = sortOptions.find(
    (opt) => opt.value === sortBy && opt.order === sortOrder
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category
            ? categories.find((c) => c.slug === category)?.name || 'Ürünler'
            : search
            ? `"${search}" için sonuçlar`
            : 'Tüm Ürünler'}
        </h1>
        <p className="text-[var(--muted)]">
          {products.length} ürün bulundu
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtrele
            </Button>

            {/* Sort */}
            <div className="relative ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                {currentSort?.label || 'Sırala'}
                <ChevronDown className="w-4 h-4" />
              </Button>
              {isSortOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsSortOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card)] rounded-xl shadow-lg border border-[var(--border)] py-2 z-20">
                    {sortOptions.map((option) => (
                      <button
                        key={`${option.value}-${option.order}`}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOrder(option.order);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--border)] transition-colors ${
                          sortBy === option.value && sortOrder === option.order
                            ? 'text-[var(--primary)] font-medium'
                            : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* View Mode */}
            <div className="hidden sm:flex items-center gap-1 border border-[var(--border)] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} variant="bordered" className="animate-pulse">
                  <div className="aspect-square bg-[var(--border)] rounded-lg mb-4" />
                  <div className="h-6 bg-[var(--border)] rounded mb-2" />
                  <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card variant="bordered" className="text-center py-12">
              <p className="text-lg font-medium mb-2">Ürün bulunamadı</p>
              <p className="text-[var(--muted)]">
                Farklı filtreler deneyebilir veya aramayı genişletebilirsiniz.
              </p>
            </Card>
          ) : (
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
