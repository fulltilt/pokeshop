import { prismaClient } from "@/db";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddToCartButton from "@/components/AddToCartButton";
import { getS3ImageUrl } from "@/app/api/images/route";
import { Button } from "@/components/ui/button";

export default async function CardDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = (await params).id;
  const item = await prismaClient.item.findUnique({
    where: { id: Number.parseInt(id) },
  });

  if (!item) {
    notFound();
  }

  const imageUrl = await getS3ImageUrl(item.image);

  return (
    <div className="max-w-2xl mx-auto flex">
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-3xl">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="gap-4 overflow-y-auto">
          <div className="relative">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={item.name}
              width={300}
              height={450}
              className={`mx-auto ${item.quantity === 0 ? "opacity-60" : ""}`}
            />
            {item.quantity === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-red-500 text-white px-4 py-2 rounded-md font-bold text-xl transform rotate-45">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
          <p className="text-lg mt-4 mb-4">{item.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>In Stock:</strong> {item.quantity > 0 ? "Yes" : "No"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <span className="text-2xl font-bold">${item.price.toFixed(2)}</span>
          {item.quantity > 0 ? (
            <AddToCartButton item={item} />
          ) : (
            <Button disabled>Out of Stock</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
