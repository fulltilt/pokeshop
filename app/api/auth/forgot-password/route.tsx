import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    // Don't reveal if a user exists or not for security reasons
    if (!user) {
      return NextResponse.json({
        message:
          "If your email exists in our system, you will receive a reset link shortly",
      });
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Delete any existing reset tokens for this user
    await prismaClient.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create a new reset token
    await prismaClient.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    // Send the reset email
    await sendPasswordResetEmail(user.email!, resetLink);

    console.log("Password reset link:", resetLink);

    return NextResponse.json({
      message:
        "If your email exists in our system, you will receive a reset link shortly",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
