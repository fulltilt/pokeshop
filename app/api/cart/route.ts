import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the user's cart
    const cart = await prismaClient.cart.findUnique({
      where: { userId: userId },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: cart.items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
