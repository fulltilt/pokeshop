// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// Mock next-auth
jest.mock("next-auth/react", () => {
  return {
    __esModule: true,
    useSession: jest.fn(() => ({
      data: {
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "CUSTOMER",
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: "authenticated",
    })),
    signIn: jest.fn(() => Promise.resolve({ ok: true })),
    signOut: jest.fn(() => Promise.resolve(true)),
    getSession: jest.fn(() =>
      Promise.resolve({
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "CUSTOMER",
        },
      })
    ),
  };
});

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
  headers: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

// Mock server-only
jest.mock("server-only", () => ({}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "test-secret",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
};

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  })
);
