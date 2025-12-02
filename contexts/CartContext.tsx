/**
 * Cart Context
 * Quản lý state giỏ hàng toàn cục
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/api';
import { CartItem } from '@/types';

// Coupon types
export interface CouponData {
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
}

export interface AppliedCoupon {
  coupon: CouponData;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number; // Total number of people (adults + children + babies)
  tourCount: number; // Number of tours in cart
  subTotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (tourId: number) => void;
  updateItem: (tourId: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  isInCart: (tourId: number) => boolean;
  getItem: (tourId: number) => CartItem | undefined;
  // Alias methods for convenience
  addToCart: (item: CartItem) => void;
  removeFromCart: (tourId: number) => void;
  updateQuantity: (tourId: number, updates: Partial<CartItem>) => void;
  getTotalAmount: () => number;
  // Coupon methods
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  getDiscountAmount: () => number;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [items]);

  const loadCart = async () => {
    try {
      const savedCart = await storage.get<CartItem[]>(STORAGE_KEYS.CART);
      if (savedCart && Array.isArray(savedCart)) {
        setItems(savedCart);
      }
    } catch (error) {
      // Silent fail - cart will be empty
    }
  };

  const saveCart = async () => {
    try {
      await storage.set(STORAGE_KEYS.CART, items);
    } catch (error) {
      // Silent fail - cart won't be persisted
    }
  };

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists
      const existingIndex = prevItems.findIndex(
        (item) => item.tourId === newItem.tourId && item.locationFrom === newItem.locationFrom
      );

      if (existingIndex >= 0) {
        // Update existing item with stock validation
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingIndex];
        
        // Calculate new quantities
        const newAdultQty = existingItem.quantityAdult + newItem.quantityAdult;
        const newChildrenQty = existingItem.quantityChildren + newItem.quantityChildren;
        const newBabyQty = existingItem.quantityBaby + newItem.quantityBaby;
        
        // Validate against stock
        const maxAdult = newItem.stockAdult || existingItem.stockAdult || 999;
        const maxChildren = newItem.stockChildren || existingItem.stockChildren || 999;
        const maxBaby = newItem.stockBaby || existingItem.stockBaby || 999;
        
        updatedItems[existingIndex] = {
          ...existingItem,
          quantityAdult: Math.min(newAdultQty, maxAdult),
          quantityChildren: Math.min(newChildrenQty, maxChildren),
          quantityBaby: Math.min(newBabyQty, maxBaby),
        };
        
        return updatedItems;
      } else {
        // Add new item with stock validation
        const maxAdult = newItem.stockAdult || 999;
        const maxChildren = newItem.stockChildren || 999;
        const maxBaby = newItem.stockBaby || 999;
        
        return [...prevItems, {
          ...newItem,
          quantityAdult: Math.min(newItem.quantityAdult, maxAdult),
          quantityChildren: Math.min(newItem.quantityChildren, maxChildren),
          quantityBaby: Math.min(newItem.quantityBaby, maxBaby),
        }];
      }
    });
  };

  const removeItem = (tourId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.tourId !== tourId));
  };

  const updateItem = (tourId: number, updates: Partial<CartItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.tourId === tourId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const isInCart = (tourId: number): boolean => {
    return items.some((item) => item.tourId === tourId);
  };

  const getItem = (tourId: number): CartItem | undefined => {
    return items.find((item) => item.tourId === tourId);
  };

  // Calculate totals
  const tourCount = items.length; // Number of tours
  
  const itemCount = items.reduce(
    (total, item) => total + item.quantityAdult + item.quantityChildren + item.quantityBaby,
    0
  ); // Total number of people

  const subTotal = items.reduce((total, item) => {
    const adultTotal = item.quantityAdult * (item.priceNewAdult || 0);
    const childrenTotal = item.quantityChildren * (item.priceNewChildren || 0);
    const babyTotal = item.quantityBaby * (item.priceNewBaby || 0);
    return total + adultTotal + childrenTotal + babyTotal;
  }, 0);

  const getDiscountAmount = () => appliedCoupon?.discountAmount || 0;
  const getFinalTotal = () => subTotal - getDiscountAmount();

  const value: CartContextType = {
    items,
    itemCount,
    tourCount,
    subTotal,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    isInCart,
    getItem,
    // Alias methods
    addToCart: addItem,
    removeFromCart: removeItem,
    updateQuantity: updateItem,
    getTotalAmount: () => subTotal,
    // Coupon
    appliedCoupon,
    setAppliedCoupon,
    getDiscountAmount,
    getFinalTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
