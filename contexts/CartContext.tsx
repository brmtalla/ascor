import { useState, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { CartItem, CartStore } from '@/types';
import * as Haptics from 'expo-haptics';

export const [CartProvider, useCart] = createContextHook(() => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((item: CartItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setItems(prev => {
      const existingIndex = prev.findIndex(
        i =>
          i.opportunityId === item.opportunityId &&
          JSON.stringify(i.selectedVariants) === JSON.stringify(item.selectedVariants)
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
        };
        return updated;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((opportunityId: string, selectedVariants: Record<string, string>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setItems(prev =>
      prev.filter(
        i =>
          !(i.opportunityId === opportunityId &&
            JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants))
      )
    );
  }, []);

  const updateQuantity = useCallback((opportunityId: string, selectedVariants: Record<string, string>, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(opportunityId, selectedVariants);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.opportunityId === opportunityId &&
        JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants)
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const clearStore = useCallback((sellerId: string) => {
    setItems(prev => prev.filter(i => i.sellerId !== sellerId));
  }, []);

  const stores = useMemo<CartStore[]>(() => {
    const storeMap = new Map<string, CartStore>();
    for (const item of items) {
      const existing = storeMap.get(item.sellerId);
      if (existing) {
        existing.items.push(item);
      } else {
        storeMap.set(item.sellerId, {
          sellerId: item.sellerId,
          sellerUsername: item.sellerUsername,
          sellerAvatar: item.sellerAvatar,
          items: [item],
        });
      }
    }
    return Array.from(storeMap.values());
  }, [items]);

  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return {
    items,
    stores,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearStore,
  };
});
