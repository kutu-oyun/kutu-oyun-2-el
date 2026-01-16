import { atom } from 'jotai';
import type { CartItem } from '@/types';

export const cartItemsAtom = atom<CartItem[]>([]);
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
});
export const cartCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((count, item) => count + item.quantity, 0);
});
export const isCartLoadingAtom = atom<boolean>(false);
