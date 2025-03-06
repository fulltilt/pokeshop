import db from "@/db";
import { executeAction } from "./executeAction";
import { prismaClient } from "@/db";
import { NextResponse } from "next/server";
import { loginSchema } from "./schema";
import bcrypt from "bcrypt";

const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get("email");
      const password = formData.get("password");
      const validatedData = loginSchema.parse({ email, password });

      // Check if user already exists
      const existingUser = await prismaClient.user.findUnique({
        where: { email: validatedData.email.toLocaleLowerCase() },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      await db.user.create({
        data: {
          email: validatedData.email.toLocaleLowerCase(),
          password: hashedPassword,
        },
      });
    },
    successMessage: "Signed up successfully",
  });
};

export { signUp };
