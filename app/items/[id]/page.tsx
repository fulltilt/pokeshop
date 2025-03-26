import { prismaClient } from "@/db";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { getImage } from "@/lib/utils";

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

  const imageUrl = await getImage(item.image);

  return (
    <div className="max-w-2xl mx-auto flex">
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-3xl">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="gap-4 overflow-y-auto">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={item.name}
            width={300}
            height={450}
            className="mx-auto"
          />
          <p className="text-lg mt-4 mb-4">{item.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>In Stock:</strong> {item.quantity > 0 ? "Yes" : "No"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <span className="text-2xl font-bold">${item.price.toFixed(2)}</span>
          <AddToCartButton item={item} />
        </CardFooter>
      </Card>
    </div>
  );
}
