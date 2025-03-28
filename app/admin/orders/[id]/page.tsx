"use client";

import { useEffect, useState } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { orderSchema } from "../../../../lib/schema";
import { z } from "zod";
import { useSession } from "next-auth/react";

type OrderSchema = z.infer<typeof orderSchema>;

function AdminOrderDetailPage() {
  const { data: session } = useSession();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderSchema>();
  const [status, setStatus] = useState(order?.status || "PENDING");

  const { id } = params;
  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((res) => setOrder(res));
  }, []);

  if (!order) {
    return <div>Order not found</div>;
  }

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    // In a real application, you would make an API call here to update the order status
    toast(`Order #${order.id} status changed to ${newStatus}`);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Order Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Customer:</strong> {order.name}
          </div>
          <div>
            <strong>Email:</strong> {order.email}
          </div>
          <div>
            <strong>Address:</strong> {order.address}, {order.city},{" "}
            {order.country} {order.zipCode}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
          <div>
            <strong>Total Amount:</strong> ${order.total.toFixed(2)}
          </div>
          <div className="flex items-center space-x-2">
            <strong>Status:</strong>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    ${(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/admin/orders")}>
            Back to Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AdminOrderDetailPage;
