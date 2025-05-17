import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, quantity } = await req.json();

  // Validate quantity
  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json(
      { error: "Quantity must be at least 1" },
      { status: 400 }
    );
  }

  try {
    // Find the cart
    const cart = await prismaClient.cart.findUnique({
      where: { userId: userId },
      include: { items: true },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Check if the item exists in the cart
    const itemExists = cart.items.some((item) => item.itemId === itemId);

    if (!itemExists) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    const cartItemId = cart?.items.filter((item) => item.itemId === itemId)[0]
      .id;

    // Update the item quantity
    const updatedItem = await prismaClient.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return NextResponse.json(
      { error: "Failed to update quantity" },
      { status: 500 }
    );
  }
}
