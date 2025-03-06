import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";

import db from "@/db";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prismaClient } from "@/db";
import bcrypt from "bcrypt";
import { loginSchema } from "./schema";

const adapter = PrismaAdapter(db);

export const { auth, handlers, signIn }: NextAuthResult = NextAuth({
  adapter,
  // session: {
  //   strategy: "jwt",
  // },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const validatedCredentials = loginSchema.parse(credentials);

        const user = await prismaClient.user.findFirst({
          where: {
            email: validatedCredentials.email,
            // password: validatedCredentials.password,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }
        const isPasswordValid = await bcrypt.compare(
          validatedCredentials.password,
          user.password!
        );

        if (!isPasswordValid) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});

// export const handlers = result.handlers;
// export const auth = result.auth;
// export const signIn = result.signIn;
// export const signOut = result.signOut;
