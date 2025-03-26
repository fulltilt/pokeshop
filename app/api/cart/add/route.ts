import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
import { prismaClient } from "@/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  //   const session = await getServerSession(authOptions)
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, quantity } = await req.json();

  try {
    const userId = session.user.id!;

    // Get or create the user's cart
    let cart = await prismaClient.cart.findUnique({
      where: { userId: userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prismaClient.cart.create({
        data: { userId: userId },
        include: { items: true },
      });
    }

    // Check if the item is already in the cart
    const existingItem = cart?.items.find((item) => item.itemId === itemId);

    if (existingItem) {
      // Update the quantity if the item already exists
      await prismaClient.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Add a new item to the cart
      await prismaClient.cartItem.create({
        data: {
          cartId: cart?.id,
          itemId: itemId,
          quantity: quantity,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
