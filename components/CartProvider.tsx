"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

type CartContextType = {
  cartItemsCount: number;
  updateCartItemsCount: () => void;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const updateCartItemsCount = useCallback(async () => {
    if (!session?.user) {
      setCartItemsCount(0);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      const count =
        data.items?.reduce(
          (total: number, item: any) => total + item.quantity,
          0
        ) || 0;

      setCartItemsCount(count);
    } catch (error) {
      console.error("Error updating cart count:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Update cart count when session changes
  useEffect(() => {
    updateCartItemsCount();
  }, [updateCartItemsCount]);

  return (
    <CartContext.Provider
      value={{ cartItemsCount, updateCartItemsCount, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
