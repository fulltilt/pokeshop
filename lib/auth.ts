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

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
    // NOTE: While using `any` isn't ideal for type safety, it's a practical solution in this case since we're working with NextAuth's internal types
    session: ({ session, token }: { session: any; token: any }) => {
      if (token && session.user) {
        // Explicitly set the user properties including role
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // For debugging
        console.log("Session callback - user role:", token.role);
      }
      return session;
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
