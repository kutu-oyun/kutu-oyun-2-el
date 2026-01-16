'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { items, total, count, isLoading, fetchCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card variant="bordered" className="max-w-md mx-auto text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sepetinizi görüntülemek için giriş yapın</h1>
          <p className="text-[var(--muted)] mb-6">
            Sepete ürün eklemek ve satın alma işlemi yapmak için hesabınıza giriş yapmalısınız.
          </p>
          <Link href="/giris">
            <Button>Giriş Yap</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Card variant="bordered" className="max-w-md mx-auto text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sepetiniz Boş</h1>
          <p className="text-[var(--muted)] mb-6">
            Henüz sepetinize ürün eklemediniz. Harika kutu oyunlarını keşfedin!
          </p>
          <Link href="/urunler">
            <Button>
              Ürünleri Keşfet
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Sepetim ({count} ürün)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} variant="bordered">
              <div className="flex gap-4">
                {/* Image */}
                <Link href={`/urun/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.images?.[0]?.url || '/placeholder-game.png'}
                    alt={item.product.title}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/urun/${item.product.id}`}>
                    <h3 className="font-semibold hover:text-[var(--primary)] transition-colors line-clamp-2">
                      {item.product.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    Satıcı: {item.product.seller?.displayName || 'Bilinmiyor'}
                  </p>
                  <p className="text-lg font-bold text-[var(--primary)] mt-2">
                    {Number(item.product.price).toLocaleString('tr-TR')} ₺
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end justify-between">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
                      disabled={isLoading}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
                      disabled={isLoading}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[var(--error)] hover:text-red-700 transition-colors text-sm flex items-center gap-1"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                    Kaldır
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card variant="bordered" className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Ara Toplam</span>
                <span>{total.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Kargo</span>
                <span className="text-[var(--success)]">Ücretsiz</span>
              </div>
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span className="text-[var(--primary)]">
                    {total.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push('/odeme')}
              className="w-full"
              size="lg"
            >
              Ödemeye Geç
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-xs text-[var(--muted)] mt-4 text-center">
              Ödeme sayfasında kargo ve fatura adresinizi belirleyeceksiniz.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
