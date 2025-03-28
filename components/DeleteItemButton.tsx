"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "./CartProvider";
import { Trash2 } from "lucide-react";

export default function DeleteItemButton({
  itemId,
  onRemoveSuccess,
}: {
  itemId: number;
  onRemoveSuccess: () => void;
}) {
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

      // Call the callback instead of reloading the page
      onRemoveSuccess();
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
      variant="ghost"
      size="icon"
      className="text-destructive hover:bg-destructive/10"
      title="Remove item"
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
