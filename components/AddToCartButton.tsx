"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCart } from "./CartProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { itemSchema } from "@/lib/schema";
import { z } from "zod";

export type ItemSchema = z.infer<typeof itemSchema> & { id: number };

export default function AddToCartButton({ item }: { item: ItemSchema }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { updateCartItemsCount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const addToCart = async () => {
    if (!session?.user) {
      toast.error("You need to be logged in to add items to your cart.");
      router.push("/sign-in");
      return;
    }

    // Check if item is in stock
    if (item.quantity <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }

    // Check if requested quantity is available
    if (quantity > item.quantity) {
      toast.error(`Only ${item.quantity} items available.`);
      setQuantity(item.quantity);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      updateCartItemsCount();
      toast.success(`${quantity} ${item.name} added to your cart.`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        onChange={(e) => {
          const val = Number(e.target.value);
          setQuantity(val > item.quantity ? item.quantity : val);
        }}
        className="w-20"
      />
      <Button onClick={addToCart} disabled={isLoading}>
        {isLoading ? "Adding..." : "Add to Cart"}
      </Button>
    </div>
  );
}
