import { useState, useEffect, useCallback } from 'react';
import type { Cart, CartItem, Product } from '@/types';

const CART_KEY = 'jve_cart';
const CART_EVENT = 'jve-cart-updated';

function calcLineTotal(product: Product, qty: number): number {
  return Math.round(product.price * qty * 100) / 100;
}

function loadCart(): Cart {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Cart;
      if (Array.isArray(parsed.items)) return parsed;
    }
  } catch { /* ignore */ }
  return { items: [], subtotal: 0 };
}

function saveCart(cart: Cart): void {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* ignore */ }
  // Defer the sync event so it fires after React finishes the current state
  // update. Otherwise, other useCart instances (e.g. the CartSidebar that just
  // opened) receive the event inside a batched update and miss the re-render.
  setTimeout(() => window.dispatchEvent(new Event(CART_EVENT)), 0);
}

function recalcSubtotal(items: CartItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.line_total, 0) * 100) / 100;
}

export function useCart() {
  const [cart, setCartState] = useState<Cart>(() => loadCart());

  const persist = useCallback((updated: Cart) => {
    setCartState(updated);
    saveCart(updated);
  }, []);

  useEffect(() => {
    // Sync cart if storage changes in another tab
    const handler = () => { const c = loadCart(); setCartState(c); };
    window.addEventListener('storage', handler);
    window.addEventListener(CART_EVENT, handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener(CART_EVENT, handler);
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCartState(prev => {
      const existing = prev.items.findIndex(i => i.product.id === product.id);
      let items: CartItem[];
      if (existing >= 0) {
        items = prev.items.map((it, idx) =>
          idx === existing
            ? { ...it, quantity: it.quantity + quantity, line_total: calcLineTotal(product, it.quantity + quantity) }
            : it
        );
      } else {
        items = [...prev.items, { product, quantity, line_total: calcLineTotal(product, quantity) }];
      }
      const updated: Cart = { items, subtotal: recalcSubtotal(items) };
      saveCart(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartState(prev => {
      const items = prev.items.map(it =>
        it.product.id === productId
          ? { ...it, quantity, line_total: calcLineTotal(it.product, quantity) }
          : it
      ).filter(it => it.quantity > 0);
      const updated: Cart = { items, subtotal: recalcSubtotal(items) };
      saveCart(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setCartState(prev => {
      const items = prev.items.filter(it => it.product.id !== productId);
      const updated: Cart = { items, subtotal: recalcSubtotal(items) };
      saveCart(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    const empty: Cart = { items: [], subtotal: 0 };
    persist(empty);
  }, [persist]);

  const itemCount = cart.items.length;

  return { cart, addToCart, updateQuantity, removeItem, clearCart, itemCount };
}
