export type Role = 'USER' | 'ADMIN';
export type Condition = 'LIKE_NEW' | 'VERY_GOOD' | 'GOOD' | 'ACCEPTABLE';
export type Language = 'TURKISH' | 'ENGLISH' | 'GERMAN' | 'LANGUAGE_INDEPENDENT';
export type ProductStatus = 'ACTIVE' | 'SOLD' | 'INACTIVE' | 'PENDING';
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    orders: number;
    favorites: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  order: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  language: Language;
  minPlayers?: number;
  maxPlayers?: number;
  minAge?: number;
  playTime?: number;
  status: ProductStatus;
  location?: string;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  seller: Pick<User, 'id' | 'displayName' | 'photoURL'>;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  _count?: {
    favorites: number;
    reviews: number;
  };
  isFavorited?: boolean;
}

export interface Address {
  id: string;
  title: string;
  contactName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  address: string;
  zipCode?: string;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  paymentId?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
  buyer: User;
  address: Address;
  items: OrderItem[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: Pick<User, 'id' | 'displayName' | 'photoURL'>;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: Pick<User, 'id' | 'displayName' | 'photoURL'>;
}

export interface Conversation {
  id: string;
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  sellerId: string;
  buyer: Pick<User, 'id' | 'displayName' | 'photoURL'>;
  seller: Pick<User, 'id' | 'displayName' | 'photoURL'>;
  product: Pick<Product, 'id' | 'title' | 'images'>;
  messages: Message[];
  _count?: {
    messages: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Condition labels
export const conditionLabels: Record<Condition, string> = {
  LIKE_NEW: 'Sıfır Gibi',
  VERY_GOOD: 'Çok İyi',
  GOOD: 'İyi',
  ACCEPTABLE: 'Kabul Edilebilir',
};

// Language labels
export const languageLabels: Record<Language, string> = {
  TURKISH: 'Türkçe',
  ENGLISH: 'İngilizce',
  GERMAN: 'Almanca',
  LANGUAGE_INDEPENDENT: 'Dil Bağımsız',
};

// Order status labels
export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
};
