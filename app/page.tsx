import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ItemSchema } from "@/components/AddToCartButton";

export default async function Home() {
  // const items = await prismaClient.item.findMany({ take: 3 });
  const response = await fetch(`${process.env.VERCEL_URL}/api/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }
  const items = (await response.json()).items;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">Welcome to DJCollects!</h2>
      <p className="text-center text-muted-foreground">
        Find the perfect individual Pokémon product for your collection!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-12">
        {items.map(async (item: ItemSchema) => {
          return (
            <Card key={item.id}>
              <CardHeader className="min-h-[3rem]">
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex items-center justify-center relative min-h-[300px]">
                <Image
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

// incremental static site generation
// export const revalidate = 60 // revalidate every 60 seconds
// or
// export const dynamic = 'force-dynamic'
