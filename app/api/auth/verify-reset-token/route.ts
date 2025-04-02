import { NextResponse } from "next/server";
import { prismaClient } from "@/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  try {
    // Find the token in the database
    const resetToken = await prismaClient.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Check if token exists and is not expired
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
