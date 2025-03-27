"use client";

import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import AddToCartButton from "@/components/AddToCartButton";
import { mockUnauthenticatedSession } from "../utils/test-utils";
import { useRouter } from "next/navigation";

// Mock the useCart hook
jest.mock("@/components/CartProvider", () => ({
  ...jest.requireActual("@/components/CartProvider"),
  useCart: () => ({
    updateCartItemsCount: jest.fn(),
  }),
}));

// Mock the useToast hook
// jest.mock("@/components/ui/use-toast", () => ({
//   useToast: () => ({
//     toast: jest.fn(),
//   }),
// }));

const mockItem = {
  id: 1,
  name: "Charizard",
  description: "Card",
  image: "/placeholder.svg",
  price: 99.99,
  quantity: 10,
};

describe("AddToCartButton Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    ) as jest.Mock;
  });

  it("renders the button and quantity input", () => {
    render(<AddToCartButton item={mockItem} />);

    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });

  it("allows changing the quantity", () => {
    render(<AddToCartButton item={mockItem} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "3" } });

    expect(input).toHaveValue(3);
  });

  it("calls the API when Add to Cart is clicked", async () => {
    render(<AddToCartButton item={mockItem} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/cart/add",
        expect.any(Object)
      );
    });
  });

  it("redirects to login if user is not authenticated", async () => {
    mockUnauthenticatedSession();
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    render(<AddToCartButton item={mockItem} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/login");
    });
  });

  it("shows loading state while adding to cart", async () => {
    // Delay the fetch response
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
              }),
            100
          )
        )
    ) as jest.Mock;

    render(<AddToCartButton item={mockItem} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    // Button should show loading state
    expect(screen.getByRole("button", { name: /adding/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /add to cart/i })
      ).toBeInTheDocument();
    });
  });

  xit("handles API errors gracefully", async () => {
    // Mock a failed API call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Failed to add item" }),
      })
    ) as jest.Mock;

    const { useToast } = jest.requireMock("@/components/ui/use-toast");

    render(<AddToCartButton item={mockItem} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(useToast().toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          variant: "destructive",
        })
      );
    });
  });
});
