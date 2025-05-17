import { prismaClient } from "@/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getS3ImageUrl } from "../../images/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt((await params).id);
  const data = await prismaClient.item.findUnique({
    where: { id: id },
  });

  if (!data) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  // const item = {
  //   ...data,
  //   image: await getS3ImageUrl(data.image),
  // };

  return NextResponse.json(data);
}

// updating an item
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;

    // Update the card
    const updatedItem = await prismaClient.item.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        image: data.image,
        price: data.price,
        description: data.description,
        quantity: data.quantity,
        releaseDate,
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

// DELETE route for deleting an item
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = Number.parseInt(params.id);

    // Check if item exists
    const existingItem = await prismaClient.item.findUnique({
      where: { id: id },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if item is used in any orders
    const itemInOrders = await prismaClient.orderItem.findFirst({
      where: { itemId: id },
    });

    if (itemInOrders) {
      return NextResponse.json(
        { error: "Cannot delete item that is referenced in orders" },
        { status: 400 }
      );
    }

    // Delete any cart items referencing this card
    await prismaClient.cartItem.deleteMany({
      where: { itemId: id },
    });

    // Delete the item
    await prismaClient.item.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
