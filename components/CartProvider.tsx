"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

type CartContextType = {
  cartItemsCount: number;
  updateCartItemsCount: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const updateCartItemsCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce(
      (total: number, item: any) => total + item.quantity,
      0
    );
    setCartItemsCount(count);
  };

  useEffect(() => {
    updateCartItemsCount();
    window.addEventListener("storage", updateCartItemsCount);
    return () => {
      window.removeEventListener("storage", updateCartItemsCount);
    };
  }, []); // Removed updateCartItemsCount from dependencies

  return (
    <CartContext.Provider value={{ cartItemsCount, updateCartItemsCount }}>
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
