import { prismaClient } from "@/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt((await params).id);

  const order = await prismaClient.order.findUnique({
    where: { id: id },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
