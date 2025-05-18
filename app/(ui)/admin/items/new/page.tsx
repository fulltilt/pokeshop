"use client";

import { ChangeEvent, useState } from "react";
import { redirect } from "next/navigation";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { itemSchema } from "@/lib/schema";
import { auth, currentUser } from "@clerk/nextjs/server";

import { cn } from "@/lib/utils";
import { useAuth, useUser } from "@clerk/nextjs";

export default function NewItemPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "ADMIN";

  if (!isAdmin) {
    redirect("/");
  }

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    price: "",
    description: "",
    quantity: "",
    releaseDate: undefined as Date | undefined,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, releaseDate: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (Object.values(formData).some((field) => field === "")) {
      toast.error("Please fill in all fields");
      return;
    }

    const { name, image, description, releaseDate } = formData;
    const quantity = Number(formData.quantity);
    const price = Number(formData.price);
    const validatedData = itemSchema.parse({
      name,
      image,
      price,
      description,
      quantity,
      releaseDate,
    });

    const response = await fetch("/api/items/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: validatedData.name,
        image: validatedData.image,
        price: validatedData.price,
        description: validatedData.description,
        quantity: validatedData.quantity,
        releaseDate: validatedData.releaseDate,
      }),
    });

    if (!response.ok) {
      toast.error("Error creating item");
    } else if (response.ok) {
      toast.success("Successfully created item!");
      redirect("/admin/items");
    }
  };

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | null | undefined = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileData = event.target?.result;

      if (fileData) {
        const presignedURL = new URL("/api/presigned", window.location.href);
        presignedURL.searchParams.set("fileName", file.name);
        presignedURL.searchParams.set("contentType", file.type);
        fetch(presignedURL.toString())
          .then((res) => res.json())
          .then((res) => {
            const body = new Blob([fileData], { type: file.type });
            fetch(res.signedUrl, {
              body,
              method: "PUT",
            }).then((res) => {
              setFormData((prev) => ({ ...prev, image: file.name }));
            });
          });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Item</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
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
                // value={formData.image} // errors out if you leave set value for form uploads
                onChange={uploadFile}
                type="file"
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
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.releaseDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.releaseDate
                      ? format(formData.releaseDate, "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.releaseDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-4">
              Add Item
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
