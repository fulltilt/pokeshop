// Move utility functions from test-utils.tsx to helpers.ts
import { jest } from "@jest/globals";

// Mock session data
export const mockSession = {
  user: {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    role: "CUSTOMER",
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
};

// Mock next/navigation hooks
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

// Mock useSession hook
export const mockUseSession = (
  status = "authenticated",
  userData = mockSession.user
) => {
  const useSessionMock = jest.fn().mockReturnValue({
    data:
      status === "authenticated"
        ? { user: userData, expires: mockSession.expires }
        : null,
    status,
  });

  // Replace the implementation
  const nextAuth = require("next-auth/react");
  nextAuth.useSession = useSessionMock;
};

// Mock admin user session
export const mockAdminSession = () => {
  mockUseSession("authenticated", {
    ...mockSession.user,
    role: "ADMIN",
  });
};

// Mock unauthenticated session
export const mockUnauthenticatedSession = () => {
  mockUseSession("unauthenticated", undefined);
};
