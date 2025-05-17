import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, quantity } = await req.json();

  try {
    // Check if the item exists and has enough stock
    const item = await prismaClient.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (item.quantity <= 0) {
      return NextResponse.json(
        { error: "Item is out of stock" },
        { status: 400 }
      );
    }

    // Get or create the user's cart
    let cart = await prismaClient.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prismaClient.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Check if the item is already in the cart
    const existingItem = cart.items.find((item) => item.itemId === itemId);

    // Calculate the new quantity
    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // Check if the new quantity exceeds available stock
    if (newQuantity > item.quantity) {
      return NextResponse.json(
        {
          error: "Not enough stock available",
          availableStock: item.quantity,
          currentCartQuantity: existingItem ? existingItem.quantity : 0,
        },
        { status: 400 }
      );
    }

    if (existingItem) {
      // Update quantity
      await prismaClient.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Add new cart item
      await prismaClient.cartItem.create({
        data: {
          cartId: cart.id,
          itemId,
          quantity,
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
