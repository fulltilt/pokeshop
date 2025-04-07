export const dynamic = "force-dynamic";

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
import { ItemSchema } from "@/components/AddToCartButton";
import { getItems } from "@/app/api/items/route";

export default async function ItemsPage() {
  const data = await getItems({
    page: 1,
    limit: 10,
    search: "",
    category: "",
  });
  const items = data.items;

  return (
    <div className="gap-8">
      <h2 className="text-3xl font-bold text-center mb-8">All Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items!.map(async (item: ItemSchema) => {
          return (
            <Card key={item.id}>
              <CardHeader className="min-h-[3rem]">
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center relative min-h-[300px]">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={200}
                  height={300}
                  className={`max-w-full h-auto ${
                    item.quantity === 0 ? "opacity-60" : ""
                  }`}
                />
                {item.quantity === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-md font-bold transform rotate-45">
                      SOLD OUT
                    </span>
                  </div>
                )}
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
          );
        })}
      </div>
    </div>
  );
}
