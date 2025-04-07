"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { toast } from "sonner";
import DeleteItemButton from "@/components/DeleteItemButton";
import { useEffect, useState } from "react";
import { ItemSchema } from "@/components/AddToCartButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ManageItems() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ItemSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait until session is loaded
    if (status === "loading") return;

    // Redirect if not admin
    if (!session || session!.user!.role !== "ADMIN") {
      router.replace("/");
    }
  }, [session, status, router]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/items");
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // let items = await prismaClient.item.findMany();

  // const handleDelete = async () => {
  //   if (
  //     !confirm(
  //       "Are you sure you want to delete this item? This action cannot be undone."
  //     )
  //   ) {
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`/api/items/2`, {
  //       method: "DELETE",
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Failed to delete item");
  //     }

  //     toast.success("Item deleted successfully");

  //     router.push("/admin/items");
  //   } catch (error: any) {
  //     console.error("Error deleting item:", error);
  //     toast.error("Failed to delete item");
  //   }
  // };

  if (status === "loading") {
    return <div>Loading...</div>; // Or a spinner
  }

  const handleItemDeleted = async () => {
    fetchItems();
  };

  // const formatDate = (dateString: string | null | undefined) => {
  //   if (!dateString) return "Not set"
  //   try {
  //     return format(new Date(dateString), "MMM d, yyyy")
  //   } catch (e) {
  //     return "Invalid date"
  //   }
  // }
  // const formattedReleaseDate = item.releaseDate ? format(new Date(item.releaseDate), "MMMM d, yyyy") : "Unknown"

  return (
    <div className="container mx-auto p-4 gap-4">
      <h1 className="text-3xl font-bold">Manage Items</h1>
      <Button className="mt-4">
        <Link href="/admin/items/new">Add New Item</Link>
      </Button>
      {isLoading ? (
        <div className="text-center py-4">Loading inventory...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {item.releaseDate
                    ? format(new Date(item.releaseDate), "MMMM d, yyyy")
                    : "Unknown"}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" className="mr-2">
                    <Link href={`/admin/items/edit/${item.id}`}>Edit</Link>
                  </Button>
                  <DeleteItemButton
                    itemId={item.id}
                    name={item.name}
                    onDeleted={handleItemDeleted}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
