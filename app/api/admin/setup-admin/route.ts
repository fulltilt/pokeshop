import { NextResponse } from "next/server";
import { prismaClient } from "@/db";
import { hash } from "bcrypt";

// This is a one-time setup route to create an admin user
// You should disable or delete this route after using it
export async function POST(req: Request) {
  // try {
  //   // Check if this is running in a production environment
  //   if (process.env.NODE_ENV === "production") {
  //     // In production, require a setup key for security
  //     const { adminEmail, adminPassword, adminName, setupKey } =
  //       await req.json();
  //     if (setupKey !== process.env.ADMIN_SETUP_KEY) {
  //       return NextResponse.json(
  //         { error: "Invalid setup key" },
  //         { status: 401 }
  //       );
  //     }
  //     // Create admin with provided details
  //     const hashedPassword = await hash(adminPassword, 10);
  //     const admin = await prismaClient.user.create({
  //       data: {
  //         email: adminEmail,
  //         name: adminName,
  //         password: hashedPassword,
  //         role: "ADMIN",
  //       },
  //     });
  //     // Return the admin ID but not the password
  //     return NextResponse.json({
  //       success: true,
  //       admin: {
  //         id: admin.id,
  //         email: admin.email,
  //         name: admin.name,
  //         role: admin.role,
  //       },
  //     });
  //   } else {
  //     // In development, create a default admin
  //     // Check if admin already exists
  //     const existingAdmin = await prismaClient.user.findFirst({
  //       where: { role: "ADMIN" },
  //     });
  //     if (existingAdmin) {
  //       return NextResponse.json({
  //         message: "Admin already exists",
  //         admin: {
  //           id: existingAdmin.id,
  //           email: existingAdmin.email,
  //           name: existingAdmin.name,
  //         },
  //       });
  //     }
  //     // Create default admin
  //     const hashedPassword = await hash(
  //       process.env.ADMIN_PASSWORD || "admin123",
  //       10
  //     );
  //     const admin = await prismaClient.user.create({
  //       data: {
  //         email: "admin@example.com",
  //         name: "Admin User",
  //         password: hashedPassword,
  //         role: "ADMIN",
  //       },
  //     });
  //     return NextResponse.json({
  //       success: true,
  //       admin: {
  //         id: admin.id,
  //         email: admin.email,
  //         name: admin.name,
  //         role: admin.role,
  //       },
  //     });
  //   }
  // } catch (error) {
  //   console.error("Error creating admin:", error);
  //   return NextResponse.json(
  //     { error: "Failed to create admin user" },
  //     { status: 500 }
  //   );
  // }
}
