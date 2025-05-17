"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCart } from "./CartProvider";
import { useUser, useAuth } from "@clerk/nextjs";

import { useRouter } from "next/navigation";
import { itemSchema } from "@/lib/schema";
import { z } from "zod";

export type ItemSchema = z.infer<typeof itemSchema> & { id: number };

export default function AddToCartButton({ item }: { item: ItemSchema }) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const { updateCartItemsCount } = useCart();

  const router = useRouter();

  const addToCart = async () => {
    if (!isSignedIn) {
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

// "use client"

// import { render, screen, fireEvent, waitFor } from "@testing-library/react"
// import AddToCartButton from "@/components/AddToCartButton"
// import { useSession } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import { useCart } from "@/components/CartProvider"
// import { useToast } from "@/components/ui/use-toast"

// // Mock next-auth/react
// jest.mock("next-auth/react", () => ({
//   useSession: jest.fn(),
// }))

// // Mock next/navigation
// jest.mock("next/navigation", () => ({
//   useRouter: jest.fn(),
// }))

// // Mock CartProvider
// jest.mock("@/components/CartProvider", () => ({
//   useCart: jest.fn(),
// }))

// // Mock toast
// jest.mock("@/components/ui/use-toast", () => ({
//   useToast: jest.fn(),
// }))

// // Mock fetch
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     ok: true,
//     json: () => Promise.resolve({ success: true }),
//   }),
// ) as jest.Mock

// describe("AddToCartButton Component", () => {
//   const mockCard = {
//     id: 1,
//     name: "Pikachu",
//     image: "/pikachu.jpg",
//     price: 10.99,
//     inStock: 10,
//   }

//   beforeEach(() => {
//     jest.clearAllMocks()

//     // Mock session
//     ;(useSession as jest.Mock).mockReturnValue({
//       data: {
//         user: {
//           id: "1",
//           name: "Test User",
//           email: "test@example.com",
//         },
//       },
//       status: "authenticated",
//     })

//     // Mock router
//     ;(useRouter as jest.Mock).mockReturnValue({
//       push: jest.fn(),
//     })

//     // Mock cart
//     ;(useCart as jest.Mock).mockReturnValue({
//       updateCartItemsCount: jest.fn(),
//     })

//     // Mock toast
//     ;(useToast as jest.Mock).mockReturnValue({
//       toast: jest.fn(),
//     })
//   })

//   it("renders the button and quantity input", () => {
//     render(<AddToCartButton card={mockCard} />)

//     expect(screen.getByRole("spinbutton")).toBeInTheDocument()
//     expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument()
//   })

//   it("allows changing the quantity", () => {
//     render(<AddToCartButton card={mockCard} />)

//     const input = screen.getByRole("spinbutton")
//     fireEvent.change(input, { target: { value: "3" } })

//     expect(input).toHaveValue(3)
//   })

//   it("calls the API when Add to Cart is clicked", async () => {
//     render(<AddToCartButton card={mockCard} />)

//     const button = screen.getByRole("button", { name: /add to cart/i })
//     fireEvent.click(button)

//     await waitFor(() => {
//       expect(global.fetch).toHaveBeenCalledWith("/api/cart/add", expect.any(Object))
//     })

//     // Check that updateCartItemsCount was called
//     const { updateCartItemsCount } = useCart()
//     expect(updateCartItemsCount).toHaveBeenCalled()

//     // Check that toast was called
//     const { toast } = useToast()
//     expect(toast).toHaveBeenCalled()
//   })

//   it("redirects to login if user is not authenticated", async () => {
//     // Mock unauthenticated session
//     ;(useSession as jest.Mock).mockReturnValue({
//       data: null,
//       status: "unauthenticated",
//     })

//     const router = useRouter()

//     render(<AddToCartButton card={mockCard} />)

//     const button = screen.getByRole("button", { name: /add to cart/i })
//     fireEvent.click(button)

//     // Check that router.push was called with /login
//     expect(router.push).toHaveBeenCalledWith("/login")

//     // Check that fetch was not called
//     expect(global.fetch).not.toHaveBeenCalled()
//   })

//   it("shows an error toast when API call fails", async () => {
//     // Mock failed API call
//     global.fetch = jest.fn(() =>
//       Promise.resolve({
//         ok: false,
//         json: () => Promise.resolve({ error: "Failed to add item" }),
//       }),
//     ) as jest.Mock

//     const { toast } = useToast()

//     render(<AddToCartButton card={mockCard} />)

//     const button = screen.getByRole("button", { name: /add to cart/i })
//     fireEvent.click(button)

//     await waitFor(() => {
//       expect(global.fetch).toHaveBeenCalled()
//     })

//     // Check that toast was called with error variant
//     expect(toast).toHaveBeenCalledWith(
//       expect.objectContaining({
//         title: "Error",
//         variant: "destructive",
//       }),
//     )
//   })
// })
