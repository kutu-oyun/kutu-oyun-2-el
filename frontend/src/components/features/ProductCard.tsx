'use client';

import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { Product } from '@/types';
import { conditionLabels } from '@/types';

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  isFavorited?: boolean;
}

export default function ProductCard({ product, onFavorite, isFavorited }: ProductCardProps) {
  const mainImage = product.images?.[0]?.url || '/placeholder-game.png';

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(product.id);
  };

  return (
    <Link href={`/urun/${product.id}`}>
      <Card
        variant="bordered"
        padding="none"
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[var(--border)]">
          <img
            src={mainImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isFavorited
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white/90 hover:bg-white text-[var(--muted)] hover:text-[var(--primary)]'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Condition Badge */}
          <Badge
            variant="secondary"
            size="sm"
            className="absolute top-3 left-3"
          >
            {conditionLabels[product.condition]}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Price */}
          <p className="text-xl font-bold text-[var(--primary)] mb-1">
            {Number(product.price).toLocaleString('tr-TR')} ₺
          </p>

          {/* Title */}
          <h3 className="font-medium text-[var(--foreground)] line-clamp-2 mb-2 group-hover:text-[var(--primary)] transition-colors">
            {product.title}
          </h3>

          {/* Category */}
          <p className="text-sm text-[var(--muted)] mb-2">{product.category?.name}</p>

          {/* Location & Favorites */}
          <div className="mt-auto flex items-center justify-between text-sm text-[var(--muted)]">
            {product.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate max-w-[120px]">{product.location}</span>
              </div>
            )}
            {product._count?.favorites !== undefined && product._count.favorites > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>{product._count.favorites}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
