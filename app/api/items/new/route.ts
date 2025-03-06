import { NextResponse } from "next/server";
import { prismaClient } from "@/db";

export async function POST(req: Request) {
  try {
    const { name, image, price, description, quantity } = await req.json();

    // Create the user
    const user = await prismaClient.item.create({
      data: {
        name,
        image,
        price,
        description,
        quantity,
      },
    });

    return NextResponse.json(
      { message: "Item created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { message: "An error occurred during item creation" },
      { status: 500 }
    );
  }
}
