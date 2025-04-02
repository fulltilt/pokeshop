import { prismaClient } from "@/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "../../lib/auth";

export default async function ProfilePage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const user = await prismaClient.user.findUnique({
    where: { email: session.user.email! },
    include: { orders: { include: { items: { include: { item: true } } } } },
  });

  if (!user) {
    return <div>User not found</div>;
  }
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {user.orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {user.orders.map((order) => (
                <li key={order.id} className="border-b pb-4">
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {order.createdAt.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Total:</strong> ${order.total.toFixed(2)}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                  <ul className="list-disc pl-5">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.item.name} - Quantity: {item.quantity} - Price: $
                        {item.price.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Button>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
