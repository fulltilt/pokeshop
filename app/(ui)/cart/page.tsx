"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteItemButton from "@/components/DeleteItemButton";
import { Skeleton } from "@/components/ui/skeleton";
import { getS3ImageUrl } from "@/app/api/images/[imageUrl]/route";
import { z } from "zod";
import { cartItemSchema } from "@/lib/schema";
import { useCart } from "@/components/CartProvider";
import QuantityAdjuster from "@/components/QuantityAdjuster";

type CartItemSchema = z.infer<typeof cartItemSchema>;

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemDetails, setItemDetails] = useState<Record<number, any>>({});
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});
  const { updateCartItemsCount } = useCart();

  // Redirect if not logged in
  useEffect(() => {
    if (session === null) {
      router.push("/sign-in");
    }
  }, [session, router]);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      if (!session?.user) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/cart");

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        const cartItems = data.items;
        setCartItems(cartItems || []);

        // Create a new object to track loading state for each item
        const newLoadingItems: Record<number, boolean> = {};
        cartItems.forEach((item: CartItemSchema) => {
          newLoadingItems[item.itemId] = true;
        });
        setLoadingItems(newLoadingItems);

        // Fetch details for each item
        const fetchItemDetails = async () => {
          const details: Record<number, any> = {};

          // Use Promise.all to fetch all items in parallel
          await Promise.all(
            cartItems.map(async (item: CartItemSchema) => {
              try {
                const response = await fetch(`/api/items/${item.itemId}`);

                if (!response.ok) {
                  throw new Error(
                    `Failed to fetch details for item ${item.itemId}`
                  );
                }

                const data = await response.json();

                const imageUrl = await getS3ImageUrl(data.image);
                data.image = imageUrl;
                details[item.itemId] = data;
              } catch (error) {
                console.error(`Error fetching item ${item.itemId}:`, error);
                details[item.itemId] = null;
              } finally {
                setLoadingItems((prev) => ({
                  ...prev,
                  [item.itemId]: false,
                }));
              }
            })
          );

          setItemDetails(details);
        };

        if (cartItems.length > 0) {
          fetchItemDetails();
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchCart();
    }
  }, [session]);

  // Handle item removal
  const handleItemRemoved = useCallback(
    (removedItemId: number) => {
      // Update cart items state optimistically
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== removedItemId)
      );

      // Update cart count
      updateCartItemsCount();
    },
    [updateCartItemsCount]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (itemId: number, newQuantity: number) => {
      // Update cart items state optimistically
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      // Update cart count
      updateCartItemsCount();
    },
    [updateCartItemsCount]
  );

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => {
    const cardPrice = itemDetails[item.itemId]?.price || 0;
    return sum + cardPrice * item.quantity;
  }, 0);

  if (isLoading) {
    return <div className="text-center py-8">Loading your cart...</div>;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-grow">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Your Cart
        </h2>
        {cartItems.length === 0 ? (
          <div className="text-center space-y-4">
            <p>Your cart is empty.</p>
            <Button>
              <Link href="/items">Browse Items</Link>
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Product</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Total</th>
                      <th className="p-2 w-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {loadingItems[item.itemId] ? (
                              <>
                                <Skeleton className="hidden sm:block h-[60px] w-[40px]" />
                                <Skeleton className="h-4 w-24" />
                              </>
                            ) : (
                              <>
                                <Image
                                  src={
                                    itemDetails[item.itemId]?.image ||
                                    "/placeholder.svg"
                                  }
                                  alt={
                                    itemDetails[item.itemId]?.name ||
                                    "Loading..."
                                  }
                                  width={40}
                                  height={60}
                                  className="hidden sm:block"
                                />
                                <span>
                                  {itemDetails[item.itemId]?.name ||
                                    "Loading..."}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          {loadingItems[item.itemId] ? (
                            <Skeleton className="h-4 w-16" />
                          ) : (
                            `$${(itemDetails[item.itemId]?.price || 0).toFixed(
                              2
                            )}`
                          )}
                        </td>
                        <td className="p-2">
                          {loadingItems[item.itemId] ? (
                            <Skeleton className="h-8 w-24" />
                          ) : (
                            <QuantityAdjuster
                              itemId={item.itemId}
                              initialQuantity={item.quantity}
                              maxQuantity={itemDetails[item.itemId]?.quantity}
                              onQuantityChange={handleQuantityChange}
                            />
                          )}
                        </td>
                        <td className="p-2">
                          {loadingItems[item.itemId] ? (
                            <Skeleton className="h-4 w-16" />
                          ) : (
                            `$${(
                              (itemDetails[item.itemId]?.price || 0) *
                              item.quantity
                            ).toFixed(2)}`
                          )}
                        </td>
                        <td className="p-2 text-right">
                          <DeleteItemButton
                            itemId={item.id}
                            onRemoveSuccess={() =>
                              handleItemRemoved(item.itemId)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <span className="text-xl md:text-2xl font-bold">
                Total: ${totalPrice.toFixed(2)}
              </span>
              <Button>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      <div className="text-center mt-8">
        <Button variant="outline">
          <Link href="/items">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
