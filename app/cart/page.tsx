// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useCart } from "@/components/CartProvider";
// import { getImage } from "@/lib/utils";

// export type CartItem = {
//   id: number;
//   name: string;
//   image: string;
//   price: number;
//   quantity: number;
// };

// export default function CartPage() {
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const router = useRouter();
//   const { updateCartItemsCount } = useCart();

//   useEffect(() => {
//     const storedCart = localStorage.getItem("cart");
//     if (storedCart) {
//       setCartItems(JSON.parse(storedCart));
//     }
//   }, []);

//   const updateQuantity = (id: number, newQuantity: number) => {
//     const updatedCart = cartItems.map((item) =>
//       item.id === id ? { ...item, quantity: newQuantity } : item
//     );
//     setCartItems(updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//   };

//   const removeItem = (id: number) => {
//     const updatedCart = cartItems.filter((item) => item.id !== id);
//     setCartItems(updatedCart);
//     localStorage.setItem("cart", JSON.stringify(updatedCart));
//     updateCartItemsCount();
//   };

//   const totalPrice = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   return (
//     <div className="space-y-8">
//       <h2 className="text-3xl font-bold text-center">Your Cart</h2>
//       {cartItems.length === 0 ? (
//         <p className="text-center">Your cart is empty.</p>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>Cart Items</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Product</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead>Quantity</TableHead>
//                   <TableHead>Total</TableHead>
//                   <TableHead></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {cartItems.map(async (item) => {
//                   const imageUrl = await getImage(item.image);

//                   return (
//                     <TableRow key={item.id}>
//                       <TableCell>
//                         <div className="flex items-center space-x-4">
//                           <Image
//                             src={imageUrl || "/placeholder.svg"}
//                             alt={item.name}
//                             width={50}
//                             height={75}
//                           />
//                           <span>{item.name}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell>${item.price.toFixed(2)}</TableCell>
//                       <TableCell>
//                         <input
//                           type="number"
//                           min="1"
//                           value={item.quantity}
//                           onChange={(e) =>
//                             updateQuantity(
//                               item.id,
//                               Number.parseInt(e.target.value)
//                             )
//                           }
//                           className="w-16 p-1 border rounded"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         ${(item.price * item.quantity).toFixed(2)}
//                       </TableCell>
//                       <TableCell>
//                         <Button
//                           variant="destructive"
//                           size="sm"
//                           onClick={() => removeItem(item.id)}
//                         >
//                           Remove
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           </CardContent>
//           <CardFooter className="flex justify-between items-center">
//             <span className="text-2xl font-bold">
//               Total: ${totalPrice.toFixed(2)}
//             </span>
//             <Button onClick={() => router.push("/checkout")}>
//               Proceed to Checkout
//             </Button>
//           </CardFooter>
//         </Card>
//       )}
//       <div className="text-center">
//         <Button variant="outline">
//           <Link href="/items">Continue Shopping</Link>
//         </Button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
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
import { getImage } from "@/lib/utils";

type CartItem = {
  id: number;
  itemId: number;
  cartId: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    image: string;
    price: number;
    description: string;
  };
};

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemDetails, setItemDetails] = useState<Record<number, any>>({});
  const [loadingItems, setLoadingItems] = useState<Record<number, boolean>>({});

  // Redirect if not logged in
  useEffect(() => {
    if (session === null) {
      router.push("/login");
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
        setCartItems(data.items || []);
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

  // Fetch details for each item
  useEffect(() => {
    // Create a new object to track loading state for each item
    const newLoadingItems: Record<number, boolean> = {};
    cartItems.forEach((item) => {
      newLoadingItems[item.itemId] = true;
    });
    setLoadingItems(newLoadingItems);

    // Fetch details for each item
    const fetchItemDetails = async () => {
      const details: Record<number, any> = {};

      // Use Promise.all to fetch all items in parallel
      await Promise.all(
        cartItems.map(async (item) => {
          try {
            const response = await fetch(`/api/items/${item.itemId}`);

            if (!response.ok) {
              throw new Error(
                `Failed to fetch details for item ${item.itemId}`
              );
            }

            const data = await response.json();

            const imageUrl = await getImage(data.image);
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
  }, [cartItems]);

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
          <p className="text-center">Your cart is empty.</p>
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
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.itemId} className="border-t">
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
                        <td className="p-2">{item.quantity}</td>
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
                        <td className="p-2">
                          <DeleteItemButton itemId={item.itemId} />
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
        <Button asChild variant="outline">
          <Link href="/items">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
