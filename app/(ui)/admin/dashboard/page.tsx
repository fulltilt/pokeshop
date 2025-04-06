import { prismaClient } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const cardCount = await prismaClient.item.count();
  const userCount = await prismaClient.user.count();
  const orderCount = await prismaClient.order.count();
  const lowStockItems = await prismaClient.item.count({
    where: { quantity: { lte: 5 } },
  });

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{cardCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{lowStockItems}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex space-x-4">
        <Button>
          <Link href="/admin/items">Manage Items</Link>
        </Button>
        <Button>
          <Link href="/admin/users">Manage Users</Link>
        </Button>
        <Button>
          <Link href="/admin/orders">Manage Orders</Link>
        </Button>
      </div>
    </div>
  );
}
