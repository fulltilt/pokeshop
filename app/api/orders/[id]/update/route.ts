import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const user = await currentUser();
  const id = (await params).id;

  // Check if user is authenticated and is an admin
  if (!userId || !user || user.publicMetadata.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orderId = Number.parseInt(id);
    const { status, trackingNumber } = await request.json();

    // Validate the order exists
    const order = await prismaClient.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the order
    const updatedOrder = await prismaClient.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
