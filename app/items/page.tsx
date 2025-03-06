import { prismaClient } from "@/db";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default async function ItemsPage() {
  const items = await prismaClient.item.findMany();

  return (
    <div className="gap-8">
      <h2 className="text-3xl font-bold text-center">All Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={200}
                height={300}
                className="mx-auto"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className="text-lg font-bold">
                ${item.price.toFixed(2)}
              </span>
              <Button>
                <Link href={`/items/${item.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
