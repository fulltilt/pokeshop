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

// Define the maximum number of login attempts before locking
const MAX_LOGIN_ATTEMPTS = 5;
// Define the lock duration in minutes
const LOCK_DURATION_MINUTES = 1;

export const { auth, handlers, signIn }: NextAuthResult = NextAuth({
  adapter,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const validatedCredentials = loginSchema.parse(credentials);

        const user = await prismaClient.user.findUnique({
          where: {
            email: validatedCredentials.email,
            // password: validatedCredentials.password,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        // Check if account is locked
        if (user.lockedUntil && new Date() < user.lockedUntil) {
          console.log("Account is locked until:", user.lockedUntil);
          throw new Error(
            `Account is locked. Please try again after ${user.lockedUntil.toLocaleString()}`
          );
        }

        const isPasswordValid = await bcrypt.compare(
          validatedCredentials.password,
          user.password!
        );

        if (!isPasswordValid) {
          console.log("Invalid password for user:", credentials.email);

          // Increment login attempts
          const updatedAttempts = user.loginAttempts + 1;

          // Check if we should lock the account
          if (updatedAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockUntil = new Date(
              Date.now() + LOCK_DURATION_MINUTES * 60 * 1000
            );

            await prismaClient.user.update({
              where: { id: user.id },
              data: {
                loginAttempts: 0, // Reset attempts
                lockedUntil: lockUntil, // Lock the account
              },
            });

            throw new Error(
              `Too many failed login attempts. Account locked for ${LOCK_DURATION_MINUTES} minutes.`
            );
          } else {
            // Just increment the attempts
            await prismaClient.user.update({
              where: { id: user.id },
              data: { loginAttempts: updatedAttempts },
            });
          }
          return null;
        }

        // Reset login attempts on successful login
        await prismaClient.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: 0,
            lockedUntil: null,
          },
        });

        console.log(
          `User authenticated successfully: ${user.email}, Role: ${user.role}`
        );

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
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
        token.id = user.id;
        // token.role = user.role;

        // For debugging
        // console.log("JWT callback - user role:", user.role);
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
  // debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
