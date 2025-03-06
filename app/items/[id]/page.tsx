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

  return (
    <div className="max-w-2xl mx-auto flex">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{item.name}</CardTitle>
        </CardHeader>
        <CardContent className="gap-4 overflow-y-auto">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            width={300}
            height={450}
            className="mx-auto"
          />
          <p className="text-lg">{item.description}</p>
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
