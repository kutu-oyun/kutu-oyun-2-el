'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import type { Category } from '@/types';
import { conditionLabels, languageLabels } from '@/types';

interface FilterSidebarProps {
  categories: Category[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ categories, isOpen = true, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    language: searchParams.get('language') || '',
    minPlayers: searchParams.get('minPlayers') || '',
    maxPlayers: searchParams.get('maxPlayers') || '',
    location: searchParams.get('location') || '',
  });

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    condition: true,
    language: false,
    players: false,
    location: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    
    router.push(`/urunler?${params.toString()}`);
    onClose?.();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      language: '',
      minPlayers: '',
      maxPlayers: '',
      location: '',
    });
    
    const search = searchParams.get('search');
    router.push(search ? `/urunler?search=${search}` : '/urunler');
    onClose?.();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const conditions = Object.entries(conditionLabels);
  const languages = Object.entries(languageLabels);

  return (
    <div
      className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-300
        fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
        w-80 lg:w-72 bg-[var(--card)] lg:bg-transparent
        overflow-y-auto
      `}
    >
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-semibold">Filtreler</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-[var(--border)] rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 lg:p-0 space-y-4">
        {/* Category */}
        <Card variant="bordered" padding="none">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium">Kategori</span>
            {expandedSections.category ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.category && (
            <div className="px-4 pb-4 space-y-1">
              <button
                onClick={() => handleFilterChange('category', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !filters.category ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--border)]'
                }`}
              >
                Tümü
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleFilterChange('category', cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    filters.category === cat.slug
                      ? 'bg-[var(--primary)] text-white'
                      : 'hover:bg-[var(--border)]'
                  }`}
                >
                  {cat.name}
                  {cat._count?.products !== undefined && (
                    <span className="text-xs opacity-70 ml-2">({cat._count.products})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Price */}
        <Card variant="bordered" padding="none">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium">Fiyat</span>
            {expandedSections.price ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.price && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="text-sm"
                />
                <span className="text-[var(--muted)]">-</span>
                <Input
                  type="number"
                  placeholder="Maks"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Condition */}
        <Card variant="bordered" padding="none">
          <button
            onClick={() => toggleSection('condition')}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium">Durum</span>
            {expandedSections.condition ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.condition && (
            <div className="px-4 pb-4 space-y-2">
              {conditions.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="condition"
                    checked={filters.condition === value}
                    onChange={() => handleFilterChange('condition', value)}
                    className="text-[var(--primary)]"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
              {filters.condition && (
                <button
                  onClick={() => handleFilterChange('condition', '')}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Temizle
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Language */}
        <Card variant="bordered" padding="none">
          <button
            onClick={() => toggleSection('language')}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium">Dil</span>
            {expandedSections.language ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.language && (
            <div className="px-4 pb-4 space-y-2">
              {languages.map(([value, label]) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    checked={filters.language === value}
                    onChange={() => handleFilterChange('language', value)}
                    className="text-[var(--primary)]"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
              {filters.language && (
                <button
                  onClick={() => handleFilterChange('language', '')}
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  Temizle
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Players */}
        <Card variant="bordered" padding="none">
          <button
            onClick={() => toggleSection('players')}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium">Oyuncu Sayısı</span>
            {expandedSections.players ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.players && (
            <div className="px-4 pb-4">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPlayers}
                  onChange={(e) => handleFilterChange('minPlayers', e.target.value)}
                  className="text-sm"
                />
                <span className="text-[var(--muted)]">-</span>
                <Input
                  type="number"
                  placeholder="Maks"
                  value={filters.maxPlayers}
                  onChange={(e) => handleFilterChange('maxPlayers', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Location */}
        <Card variant="bordered" padding="none">
          <button
            onClick={() => toggleSection('location')}
            className="w-full flex items-center justify-between p-4"
          >
            <span className="font-medium">Konum</span>
            {expandedSections.location ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {expandedSections.location && (
            <div className="px-4 pb-4">
              <Input
                type="text"
                placeholder="Şehir veya ilçe"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Uygula
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 -z-10"
          onClick={onClose}
        />
      )}
    </div>
  );
}
