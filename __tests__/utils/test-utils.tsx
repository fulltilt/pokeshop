import type React from "react";
import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/CartProvider";
import { jest } from "@jest/globals";

// Mock session data
const mockSession = {
  user: {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    role: "CUSTOMER",
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
};

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession}>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method
export { customRender as render };

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
