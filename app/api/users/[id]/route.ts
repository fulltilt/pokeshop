import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { hash } from "bcrypt";
import { auth, currentUser } from "@clerk/nextjs/server";

// Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const user = await currentUser();

  // Check if user is authenticated and is an admin
  if (!userId || !user || user.publicMetadata.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (await params).id;
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// Update a user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const user = await currentUser();

  // Check if user is authenticated and is an admin
  if (!userId || !user || user.publicMetadata.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (await params).id;
    const { name, email, role, password } = await request.json();

    // Check if user exists
    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailTaken = await prismaClient.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      role,
    };

    // Only hash and update password if provided
    if (password) {
      updateData.password = await hash(password, 10);
    }

    // Update the user
    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const user = await currentUser();

  // Check if user is authenticated and is an admin
  if (!userId || !user || user.publicMetadata.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = (await params).id;

    // Check if user exists
    const existingUser = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (existingUser.role === "ADMIN") {
      const adminCount = await prismaClient.user.count({
        where: { role: "ADMIN" },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user" },
          { status: 400 }
        );
      }
    }

    // Delete the user's cart items first
    await prismaClient.cartItem.deleteMany({
      where: {
        cart: {
          userId: userId,
        },
      },
    });

    // Delete the user's cart
    await prismaClient.cart.deleteMany({
      where: { userId: userId },
    });

    // Delete the user
    await prismaClient.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
