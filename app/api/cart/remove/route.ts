import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await req.json();

  try {
    const userId = session.user.id;

    // Find the cart
    const cart = await prismaClient.cart.findUnique({
      where: { userId: userId },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Remove the item from the cart
    await prismaClient.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
