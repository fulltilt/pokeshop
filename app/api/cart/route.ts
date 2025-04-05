import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
import { prismaClient } from "@/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session?.user?.id;

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
