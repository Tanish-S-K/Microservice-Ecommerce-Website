import { create } from 'zustand';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));
