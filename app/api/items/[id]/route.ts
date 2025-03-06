import { prismaClient } from "@/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt((await params).id);
  const item = await prismaClient.item.findUnique({
    where: { id: id },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

// updating an item
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Validate required fields
    const requiredFields = ["name", "price", "description", "quantity"];

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    if (typeof data.price !== "number" || data.price <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    if (typeof data.quantity !== "number" || data.quantity < 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-negative number" },
        { status: 400 }
      );
    }

    // Check if card exists
    const existingCard = await prismaClient.item.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Update the card
    const updatedItem = await prismaClient.item.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        image: data.image,
        price: data.price,
        description: data.description,
        quantity: data.quantity,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// New DELETE route for deleting a card
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // const session = await getServerSession(authOptions)

  // // Check if user is authenticated and is an admin
  // if (!session || !session.user || session.user.role !== "ADMIN") {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  try {
    const id = Number.parseInt(params.id);

    // Check if card exists
    const existingCard = await prismaClient.item.findUnique({
      where: { id: id },
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Check if card is used in any orders
    const cardInOrders = await prismaClient.orderItem.findFirst({
      where: { itemId: id },
    });

    if (cardInOrders) {
      return NextResponse.json(
        { error: "Cannot delete card that is referenced in orders" },
        { status: 400 }
      );
    }

    // TODO
    // Delete any cart items referencing this card
    // await prismaClient.cartItem.deleteMany({
    //   where: { cardId: id },
    // })

    // Delete the card
    await prismaClient.item.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
