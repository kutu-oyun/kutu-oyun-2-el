'use client';

import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { cartItemsAtom, cartTotalAtom, cartCountAtom, isCartLoadingAtom } from '@/atoms/cart';
import { userAtom } from '@/atoms/auth';
import { api } from '@/lib/api';
import type { CartItem } from '@/types';

export function useCart() {
  const [items, setItems] = useAtom(cartItemsAtom);
  const [isLoading, setIsLoading] = useAtom(isCartLoadingAtom);
  const total = useAtomValue(cartTotalAtom);
  const count = useAtomValue(cartCountAtom);
  const user = useAtomValue(userAtom);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.cart.get() as { items: CartItem[]; total: number };
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, setItems, setIsLoading]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!user) {
      throw new Error('Sepete eklemek için giriş yapmalısınız');
    }

    setIsLoading(true);
    try {
      await api.cart.add(productId, quantity);
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchCart, setIsLoading]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      if (quantity <= 0) {
        await api.cart.remove(itemId);
      } else {
        await api.cart.update(itemId, quantity);
      }
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart, setIsLoading]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setIsLoading(true);
    try {
      await api.cart.remove(itemId);
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  }, [fetchCart, setIsLoading]);

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.cart.clear();
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [setItems, setIsLoading]);

  return {
    items,
    total,
    count,
    isLoading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
