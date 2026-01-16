import { getIdToken } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const token = await getIdToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const api = {
  auth: {
    sync: (data: { displayName?: string; photoURL?: string; phone?: string }) =>
      request('/auth/sync', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    updateProfile: (data: { displayName?: string; phone?: string; photoURL?: string }) =>
      request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },

  products: {
    list: (params?: Record<string, string>) => {
      const searchParams = new URLSearchParams(params);
      return request(`/products?${searchParams}`, { skipAuth: true });
    },
    featured: () => request('/products/featured', { skipAuth: true }),
    get: (id: string) => request(`/products/${id}`, { skipAuth: true }),
    create: (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
    userProducts: (userId: string) => request(`/products/user/${userId}`, { skipAuth: true }),
  },

  categories: {
    list: () => request('/categories', { skipAuth: true }),
    get: (slug: string) => request(`/categories/${slug}`, { skipAuth: true }),
  },

  cart: {
    get: () => request('/cart'),
    add: (productId: string, quantity?: number) =>
      request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    update: (id: string, quantity: number) =>
      request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
    remove: (id: string) => request(`/cart/${id}`, { method: 'DELETE' }),
    clear: () => request('/cart', { method: 'DELETE' }),
  },

  orders: {
    list: (status?: string) => {
      const params = status ? `?status=${status}` : '';
      return request(`/orders${params}`);
    },
    get: (id: string) => request(`/orders/${id}`),
    create: (addressId: string) =>
      request('/orders', { method: 'POST', body: JSON.stringify({ addressId }) }),
    updateStatus: (id: string, status: string) =>
      request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    sales: (status?: string) => {
      const params = status ? `?status=${status}` : '';
      return request(`/orders/sales${params}`);
    },
  },

  favorites: {
    list: () => request('/favorites'),
    add: (productId: string) => request(`/favorites/${productId}`, { method: 'POST' }),
    remove: (productId: string) => request(`/favorites/${productId}`, { method: 'DELETE' }),
    check: (productId: string) => request(`/favorites/check/${productId}`),
  },

  reviews: {
    productReviews: (productId: string) => request(`/reviews/product/${productId}`, { skipAuth: true }),
    sellerReviews: (sellerId: string) => request(`/reviews/seller/${sellerId}`, { skipAuth: true }),
    create: (data: { productId: string; rating: number; comment?: string }) =>
      request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { rating: number; comment?: string }) =>
      request(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/reviews/${id}`, { method: 'DELETE' }),
  },

  messages: {
    conversations: () => request('/messages/conversations'),
    messages: (conversationId: string) => request(`/messages/conversations/${conversationId}`),
    createConversation: (productId: string, message?: string) =>
      request('/messages/conversations', { method: 'POST', body: JSON.stringify({ productId, message }) }),
    send: (conversationId: string, content: string) =>
      request('/messages', { method: 'POST', body: JSON.stringify({ conversationId, content }) }),
    markAsRead: (conversationId: string) =>
      request(`/messages/read/${conversationId}`, { method: 'PUT' }),
  },

  upload: {
    getSignedUrl: (fileName: string, contentType: string) =>
      request('/upload/signed-url', { method: 'POST', body: JSON.stringify({ fileName, contentType }) }),
  },

  payment: {
    create: (data: any) => request('/payment/create', { method: 'POST', body: JSON.stringify(data) }),
    status: (orderId: string) => request(`/payment/status/${orderId}`),
  },
};

export default api;
