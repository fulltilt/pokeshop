"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "./CartProvider";

export default function DeleteItemButton({ itemId }: { itemId: number }) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateCartItemsCount } = useCart();

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      updateCartItemsCount();
      toast("The item has been removed from your cart.");

      // Refresh the page to update the cart display
      window.location.reload();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRemove}
      disabled={isLoading}
      variant="destructive"
      size="sm"
    >
      {isLoading ? "Removing..." : "Remove"}
    </Button>
  );
}
