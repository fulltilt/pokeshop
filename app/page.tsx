import { prismaClient } from "@/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";
import { getImage } from "@/lib/utils";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const items = await prismaClient.item.findMany();

  // const imageUrl = await getImage("ShinyTreasures.jpg");
  // console.log(imageUrl);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-center">
        Welcome to Pokémon Singles Shop
      </h2>
      <p className="text-center text-muted-foreground">
        Find the perfect individual Pokémon cards for your collection!
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-12">
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

// incremental static site generation
// export const revalidate = 60 // revalidate every 60 seconds
// or
// export const dynamic = 'force-dynamic'
