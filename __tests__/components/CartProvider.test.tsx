"use client";

import { render, act, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "@/components/CartProvider";

// Mock next-auth/react without using requireActual
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { id: "1" },
    },
    status: "authenticated",
  })),
  // Create a simple mock for SessionProvider
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-session-provider">{children}</div>
  ),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ items: [{ quantity: 2 }, { quantity: 3 }] }),
  })
) as jest.Mock;

// Test component that uses the useCart hook
const TestComponent = () => {
  const { cartItemsCount, updateCartItemsCount, isLoading } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cartItemsCount}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <button onClick={() => updateCartItemsCount()}>Update Cart</button>
      {/* <button onClick={() => clearCart()}>Clear Cart</button> */}
    </div>
  );
};

describe("CartProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides cart context to children", async () => {
    const { getByTestId } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Wait for initial cart fetch to complete
    await waitFor(() => {
      expect(getByTestId("cart-count").textContent).toBe("5"); // 2 + 3
    });
  });

  it("updates cart count when updateCartItemsCount is called", async () => {
    const { getByTestId, getByText } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Wait for initial cart fetch to complete
    await waitFor(() => {
      expect(getByTestId("cart-count").textContent).toBe("5");
    });

    // Mock a different response for the next fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ items: [{ quantity: 1 }, { quantity: 1 }] }),
      })
    ) as jest.Mock;

    // Click update button
    act(() => {
      getByText("Update Cart").click();
    });

    // Wait for cart count to update
    await waitFor(() => {
      expect(getByTestId("cart-count").textContent).toBe("2");
    });
  });

  // it("clears cart when clearCart is called", async () => {
  //   const { getByTestId, getByText } = render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );

  //   // Wait for initial cart fetch to complete
  //   await waitFor(() => {
  //     expect(getByTestId("cart-count").textContent).toBe("5");
  //   });

  //   // Mock a successful clear cart response
  //   global.fetch = jest.fn(() =>
  //     Promise.resolve({
  //       ok: true,
  //       json: () => Promise.resolve({ success: true }),
  //     })
  //   ) as jest.Mock;

  //   // Click clear button
  //   act(() => {
  //     getByText("Clear Cart").click();
  //   });

  //   // Wait for cart count to be cleared
  //   await waitFor(() => {
  //     expect(getByTestId("cart-count").textContent).toBe("0");
  //   });
  // });

  // it("handles fetch errors gracefully", async () => {
  //   // Mock a failed fetch
  //   global.fetch = jest.fn(() =>
  //     Promise.resolve({
  //       ok: false,
  //       json: () => Promise.resolve({ error: "Failed to fetch cart" }),
  //     })
  //   ) as jest.Mock;

  //   console.error = jest.fn(); // Suppress console errors

  //   const { getByTestId } = render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );

  //   // Wait for fetch to complete
  //   await waitFor(() => {
  //     expect(getByTestId("cart-count").textContent).toBe("0");
  //     expect(console.error).toHaveBeenCalled();
  //   });
  // });

  // it("sets cart count to 0 when user is not authenticated", async () => {
  //   // Override the default mock for this specific test
  //   const useSessionMock = require("next-auth/react").useSession;
  //   useSessionMock.mockReturnValueOnce({
  //     data: null,
  //     status: "unauthenticated",
  //   });

  //   const { getByTestId } = render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );

  //   // Cart count should be 0 for unauthenticated users
  //   await waitFor(() => {
  //     expect(getByTestId("cart-count").textContent).toBe("0");
  //   });

  //   // Fetch should not be called for unauthenticated users
  //   expect(global.fetch).not.toHaveBeenCalled();
  // });
});
