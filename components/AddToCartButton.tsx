"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { itemSchema } from "@/lib/schema";
import { z } from "zod";
import { useCart } from "./CartProvider";

export type ItemSchema = z.infer<typeof itemSchema> & { id: number };

export default function AddToCartButton({ item }: { item: ItemSchema }) {
  const [quantity, setQuantity] = useState(1);
  const { updateCartItemsCount } = useCart();

  const addToCart = () => {
    const cartItem = {
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: quantity,
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = cart.findIndex((i: any) => i.id === item.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartItemsCount();
    toast(`${quantity} ${item.name} added to your cart.`);
  };

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="quantity" className="sr-only">
        Quantity
      </Label>
      <Input
        id="quantity"
        type="number"
        min="1"
        max={item.quantity}
        value={quantity}
        onChange={(e) => setQuantity(Number.parseInt(e.target.value))}
        className="w-20"
      />
      <Button onClick={addToCart}>Add to Cart</Button>
    </div>
  );
}
