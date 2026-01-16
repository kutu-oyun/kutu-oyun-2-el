'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Share2,
  MessageSquare,
  ShoppingCart,
  MapPin,
  Calendar,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ProductCard } from '@/components/features';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import type { Product, Review } from '@/types';
import { conditionLabels, languageLabels } from '@/types';

// Mock data
const mockProduct: Product = {
  id: '1',
  title: 'Catan - Türkçe Deluxe Edition',
  description: `Catan, dünya çapında en çok satılan masa oyunlarından biridir. 
  
Bu özel Deluxe Edition'da ahşap parçalar ve yüksek kaliteli kartonlar bulunmaktadır. Oyun tam eksiksiz, kutusu hafif yıpranmış ama içi sıfır gibi.

Oyun 2-4 kişi için uygundur ve ortalama 60-90 dakika sürer. 10 yaş ve üzeri için önerilir.

İstanbul Kadıköy'den elden teslim veya kargo ile gönderim yapabilirim.`,
  price: 450,
  condition: 'VERY_GOOD',
  language: 'TURKISH',
  minPlayers: 2,
  maxPlayers: 4,
  minAge: 10,
  playTime: 90,
  status: 'ACTIVE',
  location: 'İstanbul, Kadıköy',
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  sellerId: '1',
  seller: { id: '1', displayName: 'Ahmet Yılmaz', photoURL: undefined },
  categoryId: '1',
  category: { id: '1', name: 'Strateji Oyunları', slug: 'strateji' },
  images: [
    { id: '1', url: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=800', order: 0 },
    { id: '2', url: 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800', order: 1 },
    { id: '3', url: 'https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=800', order: 2 },
  ],
  _count: { favorites: 12, reviews: 3 },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, isLoading: isCartLoading } = useCart();
  
  const [product, setProduct] = useState<Product | null>(mockProduct);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const data = await api.products.get(params.id as string) as Product & { isFavorited: boolean };
        setProduct(data);
        setIsFavorited(data.isFavorited || false);
      } catch (error) {
        console.log('Using mock data');
        setProduct(mockProduct);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleFavorite = async () => {
    if (!user) {
      router.push('/giris');
      return;
    }

    try {
      if (isFavorited) {
        await api.favorites.remove(product!.id);
      } else {
        await api.favorites.add(product!.id);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Favorite error:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/giris');
      return;
    }

    try {
      await addToCart(product!.id);
      // Show success toast
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleMessage = () => {
    if (!user) {
      router.push('/giris');
      return;
    }
    router.push(`/panel/mesajlar?product=${product!.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product!.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const nextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-[var(--border)] rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-[var(--border)] rounded w-3/4" />
              <div className="h-10 bg-[var(--border)] rounded w-1/3" />
              <div className="h-24 bg-[var(--border)] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Ürün bulunamadı</h1>
        <Link href="/urunler">
          <Button>Ürünlere Dön</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === product.sellerId;
  const sellerMemberSince = new Date(product.createdAt).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)]">Anasayfa</Link>
        <span>/</span>
        <Link href="/urunler" className="hover:text-[var(--foreground)]">Ürünler</Link>
        <span>/</span>
        <Link href={`/urunler?category=${product.category.slug}`} className="hover:text-[var(--foreground)]">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)] truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--border)]">
            <img
              src={product.images[currentImageIndex]?.url || '/placeholder-game.png'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge variant="secondary">{conditionLabels[product.condition]}</Badge>
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleFavorite}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md ${
                  isFavorited ? 'bg-[var(--primary)] text-white' : 'bg-white/90 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-[var(--primary)]'
                      : 'border-transparent hover:border-[var(--border)]'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Title & Price */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-3xl md:text-4xl font-bold text-[var(--primary)]">
              {Number(product.price).toLocaleString('tr-TR')} ₺
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {product.location && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{product.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(product.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
            {(product.minPlayers || product.maxPlayers) && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                  {product.minPlayers === product.maxPlayers
                    ? `${product.minPlayers} kişi`
                    : `${product.minPlayers}-${product.maxPlayers} kişi`}
                </span>
              </div>
            )}
            {product.playTime && (
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{product.playTime} dakika</span>
              </div>
            )}
          </div>

          {/* Properties */}
          <Card variant="bordered" className="mb-6">
            <h3 className="font-semibold mb-3">Ürün Özellikleri</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-[var(--muted)]">Durum:</span>
              <span>{conditionLabels[product.condition]}</span>
              <span className="text-[var(--muted)]">Dil:</span>
              <span>{languageLabels[product.language]}</span>
              <span className="text-[var(--muted)]">Kategori:</span>
              <Link
                href={`/urunler?category=${product.category.slug}`}
                className="text-[var(--primary)] hover:underline"
              >
                {product.category.name}
              </Link>
              {product.minAge && (
                <>
                  <span className="text-[var(--muted)]">Yaş:</span>
                  <span>{product.minAge}+</span>
                </>
              )}
            </div>
          </Card>

          {/* Actions */}
          {!isOwner && (
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
                isLoading={isCartLoading}
              >
                <ShoppingCart className="w-5 h-5" />
                Sepete Ekle
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleMessage}
              >
                <MessageSquare className="w-5 h-5" />
                Mesaj Gönder
              </Button>
            </div>
          )}

          {/* Seller Card */}
          <Card variant="bordered">
            <div className="flex items-center gap-4 mb-4">
              {product.seller.photoURL ? (
                <img
                  src={product.seller.photoURL}
                  alt={product.seller.displayName || ''}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 bg-[var(--primary)] rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {product.seller.displayName?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{product.seller.displayName || 'Satıcı'}</h3>
                <p className="text-sm text-[var(--muted)]">{sellerMemberSince}'den beri üye</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/satici/${product.sellerId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Satıcı Profili
                </Button>
              </Link>
              {!isOwner && (
                <Button variant="outline" onClick={handleMessage}>
                  <MessageSquare className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center gap-4 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-[var(--success)]" />
              <span>Güvenli Ödeme</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <button className="hover:text-[var(--primary)]">Şikayet Et</button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card variant="bordered" className="mb-12">
        <h2 className="text-xl font-bold mb-4">Ürün Açıklaması</h2>
        <div className="prose prose-sm max-w-none text-[var(--foreground)]">
          {product.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      {/* Seller's Other Products */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Satıcının Diğer Ürünleri</h2>
          <Link
            href={`/satici/${product.sellerId}`}
            className="text-[var(--primary)] hover:underline text-sm"
          >
            Tümünü Gör
          </Link>
        </div>
        <p className="text-[var(--muted)] text-sm">Henüz başka ürün yok.</p>
      </section>
    </div>
  );
}
