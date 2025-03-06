"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { orderSchema } from "../../lib/schema";
import { z } from "zod";

export type OrderSchema = z.infer<typeof orderSchema>;

export default function ThankYouPage() {
  const [order, setOrder] = useState<OrderSchema>();

  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    localStorage.removeItem("cart");

    fetch(`/api/order/${orderId}`)
      .then((res) => res.json())
      .then((res) => setOrder(res))
      .catch((err) => console.log(err));
  }, []);

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Thank You for Your Order!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">
            Your order has been received and is being processed. You will
            receive an email confirmation shortly.
          </p>
          <div className="space-y-2">
            <h3 className="font-bold">Order Details:</h3>
            <p>Order ID: {order?.id}</p>
            <p>Total Amount: ${order.total.toFixed(2)}</p>
            <p>Status: {order.status}</p>
            <h4 className="font-bold mt-4">Items:</h4>
            <ul className="list-disc pl-5">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.item.name} - Quantity: {item.quantity} - Price: $
                  {item.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
