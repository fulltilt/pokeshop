import { GET, PUT, DELETE } from "@/app/api/users/[id]/route";
import { prismaClient } from "@/db";
import { hash } from "bcrypt";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  hash: jest.fn(() => Promise.resolve("hashed_password")),
}));

// Mock the auth module
jest.mock("@/lib/auth", () => ({
  authOptions: {},
}));

// Mock getServerSession
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(() =>
    Promise.resolve({
      user: {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      },
    })
  ),
}));

// Mock the prisma client
jest.mock("@/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cart: {
      deleteMany: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    passwordResetToken: {
      deleteMany: jest.fn(),
    },
  },
}));

// Helper to create a mock request
const createMockRequest = (body?: any) => {
  return {
    json: () => Promise.resolve(body),
  } as unknown as Request;
};

describe("User Management API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET user", () => {
    it("returns user data for admin", async () => {
      // Mock user exists
      prismaClient.user.findUnique.mockResolvedValue({
        id: 2,
        name: "Test User",
        email: "test@example.com",
        role: "CUSTOMER",
        createdAt: new Date(),
      });

      const req = createMockRequest();
      const res = await GET(req, { params: { id: "2" } });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        id: 2,
        name: "Test User",
        email: "test@example.com",
        role: "CUSTOMER",
        createdAt: expect.any(Date),
      });
    });
  });

  describe("PUT user", () => {
    it("updates a user successfully", async () => {
      // Mock user exists
      prismaClient.user.findUnique.mockResolvedValueOnce({
        id: 2,
        name: "Old Name",
        email: "old@example.com",
        role: "CUSTOMER",
      });

      // Mock no email conflict
      prismaClient.user.findUnique.mockResolvedValueOnce(null);

      // Mock user update
      prismaClient.user.update.mockResolvedValue({
        id: 2,
        name: "New Name",
        email: "new@example.com",
        role: "ADMIN",
        createdAt: new Date(),
      });

      const req = createMockRequest({
        name: "New Name",
        email: "new@example.com",
        role: "ADMIN",
        password: "newpassword",
      });

      const res = await PUT(req, { params: { id: "2" } });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({
        id: 2,
        name: "New Name",
        email: "new@example.com",
        role: "ADMIN",
        createdAt: expect.any(Date),
      });

      // Check that password was hashed
      expect(hash).toHaveBeenCalledWith("newpassword", 10);

      // Check that user was updated with hashed password
      expect(prismaClient.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: {
          name: "New Name",
          email: "new@example.com",
          role: "ADMIN",
          password: "hashed_password",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    });
  });

  describe("DELETE user", () => {
    it("deletes a user successfully", async () => {
      // Mock user exists
      prismaClient.user.findUnique.mockResolvedValue({
        id: 2,
        name: "Test User",
        email: "test@example.com",
        role: "CUSTOMER",
      });

      // Mock admin count
      prismaClient.user.count.mockResolvedValue(2);

      const req = createMockRequest();
      const res = await DELETE(req, { params: { id: "2" } });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ success: true });

      // Check that cart items were deleted
      expect(prismaClient.cartItem.deleteMany).toHaveBeenCalled();

      // Check that cart was deleted
      expect(prismaClient.cart.deleteMany).toHaveBeenCalled();

      // Check that password reset token was deleted
      expect(prismaClient.passwordResetToken.deleteMany).toHaveBeenCalled();

      // Check that user was deleted
      expect(prismaClient.user.delete).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it("prevents deleting the last admin", async () => {
      // Mock user exists and is an admin
      prismaClient.user.findUnique.mockResolvedValue({
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
      });

      // Mock only one admin exists
      prismaClient.user.count.mockResolvedValue(1);

      const req = createMockRequest();
      const res = await DELETE(req, { params: { id: "1" } });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toEqual({ error: "Cannot delete the last admin user" });

      // Check that user was not deleted
      expect(prismaClient.user.delete).not.toHaveBeenCalled();
    });
  });
});
