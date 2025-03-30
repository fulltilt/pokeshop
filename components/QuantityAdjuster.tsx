"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";

type QuantityAdjusterProps = {
  itemId: number;
  initialQuantity: number;
  maxQuantity: number;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
};

export default function QuantityAdjuster({
  itemId,
  initialQuantity,
  maxQuantity,
  onQuantityChange,
}: QuantityAdjusterProps) {
  // Use local state to track the quantity
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when initialQuantity prop changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > maxQuantity) return;

    // Update local state immediately for responsive UI
    setQuantity(newQuantity);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/cart/update-quantity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Call the parent callback AFTER successful API call
      onQuantityChange(itemId, newQuantity);

      // No need for toast on success to avoid too many notifications
    } catch (error) {
      console.error("Error updating quantity:", error);
      // Revert to previous quantity on error
      setQuantity(initialQuantity);

      toast.error("Failed to update quantity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(quantity - 1)}
        disabled={isLoading || quantity <= 1}
      >
        <Minus className="h-3 w-3" />
      </Button>

      <span className="w-8 text-center">{quantity}</span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => updateQuantity(quantity + 1)}
        disabled={isLoading || quantity >= maxQuantity}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
