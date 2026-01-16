'use client';

import Link from 'next/link';
import {
  Swords,
  Users,
  PartyPopper,
  CreditCard,
  Baby,
  Handshake,
  Target,
  Coins,
  Puzzle,
  Dice5,
  Layers,
  UserCog,
} from 'lucide-react';
import { Card } from '@/components/ui';
import type { Category } from '@/types';

const iconMap: Record<string, React.ComponentType<any>> = {
  chess: Target,
  users: Users,
  'party-popper': PartyPopper,
  cards: CreditCard,
  baby: Baby,
  handshake: Handshake,
  swords: Swords,
  coins: Coins,
  puzzle: Puzzle,
  'dice-5': Dice5,
  layers: Layers,
  'users-cog': UserCog,
};

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon || 'dice-5'] || Dice5;

  return (
    <Link href={`/urunler?category=${category.slug}`}>
      <Card
        variant="bordered"
        className="group hover:border-[var(--primary)] hover:shadow-md transition-all duration-300 text-center"
      >
        <div className="w-14 h-14 mx-auto mb-3 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
          <Icon className="w-7 h-7 text-[var(--primary)] group-hover:text-white transition-colors" />
        </div>
        <h3 className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors">
          {category.name}
        </h3>
        {category._count?.products !== undefined && (
          <p className="text-xs text-[var(--muted)] mt-1">
            {category._count.products} ürün
          </p>
        )}
      </Card>
    </Link>
  );
}
