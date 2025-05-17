import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { useUser, useAuth } from "@clerk/nextjs";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get query parameters
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const limit = Number.parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || undefined;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the where clause for filtering
    const where: any = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Get total count for pagination
    const totalCount = await prismaClient.user.count({ where });

    // Fetch users with pagination
    const users = await prismaClient.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        id: "asc",
      },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    // Return the users with pagination metadata
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
