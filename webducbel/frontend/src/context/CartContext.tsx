import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'lineTotal' | 'lineWeight'>) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  removeItem: (skuId: string) => void;
  clearCart: () => void;
  totalBags: number;
  totalWeightKg: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'gao_nha_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addItem = (newItem: Omit<CartItem, 'lineTotal' | 'lineWeight'>) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.skuId === newItem.skuId);
      if (existingIdx > -1) {
        const next = [...prev];
        const existing = next[existingIdx];
        const newQty = existing.quantity + newItem.quantity;
        next[existingIdx] = {
          ...existing,
          quantity: newQty,
          lineTotal: newQty * existing.unitPrice,
          lineWeight: newQty * existing.weightKg,
        };
        return next;
      } else {
        return [
          ...prev,
          {
            ...newItem,
            lineTotal: newItem.quantity * newItem.unitPrice,
            lineWeight: newItem.quantity * newItem.weightKg,
          },
        ];
      }
    });
  };

  const updateQuantity = (skuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(skuId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.skuId === skuId) {
          return {
            ...item,
            quantity,
            lineTotal: quantity * item.unitPrice,
            lineWeight: quantity * item.weightKg,
          };
        }
        return item;
      }),
    );
  };

  const removeItem = (skuId: string) => {
    setItems((prev) => prev.filter((item) => item.skuId !== skuId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalBags = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightKg = items.reduce((sum, item) => sum + item.lineWeight, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalBags,
        totalWeightKg,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

