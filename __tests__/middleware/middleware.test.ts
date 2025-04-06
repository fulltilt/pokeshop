import type { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { getToken } from "next-auth/jwt";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// Mock next/server
jest.mock("next/server", () => {
  const originalModule = jest.requireActual("next/server");
  return {
    ...originalModule,
    NextResponse: {
      next: jest.fn(() => "next response"),
      redirect: jest.fn((url) => ({ redirectUrl: url })),
    },
  };
});

// Mock next-auth/jwt
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

describe("Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create a mock request
  const createMockRequest = (path: string) => {
    const url = `http://localhost:3000${path}`;
    return {
      url,
      nextUrl: new URL(url),
    } as unknown as NextRequest;
  };

  it("allows public routes without authentication", async () => {
    // Mock no token (unauthenticated)
    (getToken as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest("/");
    const res = await middleware(req);

    // Should proceed to the route
    expect(res).toBe("next response");
  });

  it("redirects to login for protected routes when not authenticated", async () => {
    // Mock no token (unauthenticated)
    (getToken as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest("/profile");
    const res = await middleware(req);

    // Should redirect to login
    expect(res).toHaveProperty("redirectUrl");
    expect(res.redirectUrl.toString()).toContain("/login");
  });

  it("allows access to profile for authenticated users", async () => {
    // Mock authenticated user token
    (getToken as jest.Mock).mockResolvedValue({
      id: "1",
      role: "CUSTOMER",
    });

    const req = createMockRequest("/profile");
    const res = await middleware(req);

    // Should proceed to the route
    expect(res).toBe("next response");
  });

  it("redirects to home for admin routes when user is not an admin", async () => {
    // Mock non-admin user token
    (getToken as jest.Mock).mockResolvedValue({
      id: "1",
      role: "CUSTOMER",
    });

    const req = createMockRequest("/admin/users");
    const res = await middleware(req);

    // Should redirect to home
    expect(res).toHaveProperty("redirectUrl");
    expect(res.redirectUrl.toString()).toBe("http://localhost:3000/");
  });

  it("allows access to admin routes for admin users", async () => {
    // Mock admin user token
    (getToken as jest.Mock).mockResolvedValue({
      id: "1",
      role: "ADMIN",
    });

    const req = createMockRequest("/admin/users");
    const res = await middleware(req);

    // Should proceed to the route
    expect(res).toBe("next response");
  });
});
