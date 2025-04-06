import { PUT as updateOrder } from "@/app/api/orders/[id]/update/route";
import { prismaClient } from "@/db";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

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
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Helper to create a mock request
const createMockRequest = (body: any) => {
  return {
    json: () => Promise.resolve(body),
  } as unknown as Request;
};

describe("Order Update API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates an order successfully", async () => {
    // Mock order exists
    prismaClient.order.findUnique.mockResolvedValue({
      id: 1,
      status: "PENDING",
      trackingNumber: null,
    });

    // Mock order update
    prismaClient.order.update.mockResolvedValue({
      id: 1,
      status: "SHIPPED",
      trackingNumber: "123456789",
    });

    const req = createMockRequest({
      status: "SHIPPED",
      trackingNumber: "123456789",
    });

    const res = await updateOrder(req, { params: { id: "1" } });
    const data = await res.json();

    expect(data).toEqual({
      id: 1,
      status: "SHIPPED",
      trackingNumber: "123456789",
    });

    expect(prismaClient.order.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        status: "SHIPPED",
        trackingNumber: "123456789",
        updatedAt: expect.any(Date),
      },
    });
  });

  it("returns 404 if order does not exist", async () => {
    // Mock order does not exist
    prismaClient.order.findUnique.mockResolvedValue(null);

    const req = createMockRequest({
      status: "SHIPPED",
      trackingNumber: "123456789",
    });

    const res = await updateOrder(req, { params: { id: "1" } });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({ error: "Order not found" });
  });

  it("returns 401 if user is not an admin", async () => {
    // Mock non-admin user
    const getServerSession = require("next-auth/next").getServerSession;
    getServerSession.mockResolvedValueOnce({
      user: {
        id: "2",
        name: "Regular User",
        email: "user@example.com",
        role: "CUSTOMER",
      },
    });

    const req = createMockRequest({
      status: "SHIPPED",
      trackingNumber: "123456789",
    });

    const res = await updateOrder(req, { params: { id: "1" } });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toEqual({ error: "Unauthorized" });
  });
});
