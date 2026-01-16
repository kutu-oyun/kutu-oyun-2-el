'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { ProductCard } from '@/components/features';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Product } from '@/types';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await api.favorites.list() as Product[];
        setFavorites(data);
      } catch (error) {
        console.error('Fetch favorites error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await api.favorites.remove(productId);
      setFavorites(favorites.filter((f) => f.id !== productId));
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Favorilerim</h1>

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
      ) : favorites.length === 0 ? (
        <Card variant="bordered" className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto text-[var(--muted)] mb-4" />
          <p className="text-lg font-medium mb-2">Henüz favoriniz yok</p>
          <p className="text-[var(--muted)] mb-4">
            Beğendiğiniz ürünleri favorilere ekleyerek takip edebilirsiniz.
          </p>
          <Link href="/urunler">
            <Button>Ürünleri Keşfet</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={true}
              onFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
