"use client";

import React from "react";
import { useState, useEffect } from "react";
import { redirect, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { itemSchema } from "@/lib/schema";
import { useSession } from "next-auth/react";

export default function EditItemPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    price: "",
    description: "",
    quantity: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    fetch(`/api/items/${id}`)
      .then((res) => res.json())
      .then((item) => {
        if (item) {
          setFormData({
            name: item.name,
            image: item.image,
            price: item.price.toString(),
            description: item.description,
            quantity: item.quantity.toString(),
          });
        }
      })
      .catch((err) => {
        toast.error("Item not found");
        router.push("/admin/items");
      });
  }, [id, router, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic form validation
    if (Object.values(formData).some((field) => field === "")) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const { name, image, description } = formData;
    const quantity = Number(formData.quantity);
    const price = Number(formData.price);
    const validatedData = itemSchema.parse({
      name,
      image,
      price,
      description,
      quantity,
    });

    const response = await fetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: validatedData.name,
        image: validatedData.image,
        price: validatedData.price,
        description: validatedData.description,
        quantity: validatedData.quantity,
      }),
    });

    if (!response.ok) {
      toast.error("Error updating item");
    } else if (response.ok) {
      toast.success("Successfully updated item!");
      redirect("/admin/items");
    }

    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this card? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item");
      }

      toast.success("Item deleted successfully");

      router.push("/admin/items");
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit item</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">item Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/items")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Item"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
