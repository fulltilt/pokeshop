import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { ItemSchema } from "@/components/AddToCartButton";
import { getImage } from "@/lib/utils";

export async function GET(request: Request) {
  // Get query parameters
  const url = new URL(request.url);
  const page = Number.parseInt(url.searchParams.get("page") || "1");
  const limit = Number.parseInt(url.searchParams.get("limit") || "10");
  const search = url.searchParams.get("search") || undefined;
  const category = url.searchParams.get("category") || undefined;

  // Calculate pagination
  const skip = (page - 1) * limit;

  try {
    // Build the where clause for filtering
    const where: any = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive", // Case-insensitive search
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Add category filter if provided
    if (category) {
      where.category = category;
    }
    // Get total count for pagination metadata
    const totalCount = await prismaClient.item.count({ where });

    // Fetch items with pagination
    const data = await prismaClient.item.findMany({
      where,
      orderBy: {
        id: "asc", // You can change this to any field
      },
      skip,
      take: limit,
    });

    const items = await Promise.all(
      data.map(async (item: ItemSchema) => {
        const imageUrl = await getImage(item.image);

        return {
          ...item,
          image: imageUrl,
        };
      })
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    // Return the items with pagination metadata
    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
