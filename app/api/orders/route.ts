import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  //   const session = await getServerSession(authOptions)

  //   // Check if user is authenticated
  //   if (!session || !session.user) {
  //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  //   }
  const { userId } = await auth();
  const user = await currentUser();

  // Check if user is authenticated and is an admin
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : undefined;
    const page = url.searchParams.get("page")
      ? parseInt(url.searchParams.get("page")!)
      : 1;
    const status = url.searchParams.get("status") || undefined;
    const userId = url.searchParams.get("userId")
      ? parseInt(url.searchParams.get("userId")!)
      : undefined;

    // Calculate pagination
    const skip = page && limit ? (page - 1) * limit : undefined;

    // Build the where clause
    const where: any = {};

    // If the user is not an admin, they can only see their own orders
    // if (session.user.role !== "ADMIN") {
    //   where.userId = parseInt(session.user.id)
    // }
    // // If userId is specified and user is admin, filter by that userId
    // else if (userId) {
    //   where.userId = userId
    // }
    where.userId = userId; // if user can access this page, they must be an admin

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Get total count for pagination
    const totalOrders = await prismaClient.order.count({ where });

    // Get orders with pagination
    const orders = await prismaClient.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = limit ? Math.ceil(totalOrders / limit) : 1;
    const hasMore = page < totalPages;

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
