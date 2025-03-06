import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
import { prismaClient } from "@/db";

export async function GET(request: Request) {
  //   const session = await getServerSession(authOptions)

  //   // Check if user is authenticated
  //   if (!session || !session.user) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //   }

  try {
    const cards = await prismaClient.item.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
