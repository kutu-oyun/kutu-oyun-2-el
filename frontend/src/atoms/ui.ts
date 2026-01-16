import { atom } from 'jotai';

// Mobile menu
export const isMobileMenuOpenAtom = atom<boolean>(false);

// Search
export const searchQueryAtom = atom<string>('');

// Filters
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  language?: string;
  minPlayers?: number;
  maxPlayers?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const filtersAtom = atom<ProductFilters>({});

// Location
export const selectedLocationAtom = atom<string>('');
