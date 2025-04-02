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

  it("shows loading state while adding to cart", async () => {
    // Create a delayed promise that we can resolve manually
    let resolvePromise: (value: any) => void = () => {};
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    ) as jest.Mock;

    render(<AddToCartButton item={mockItem} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    // Check that the button is disabled during loading
    expect(button).toBeDisabled();

    // Check that the button text changes to "Adding..."
    expect(button).toHaveTextContent(/adding/i);

    // Resolve the fetch promise
    resolvePromise({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    // Wait for the button to return to its original state
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent(/add to cart/i);
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

  it("redirects to login if user is not authenticated", async () => {
    mockUnauthenticatedSession(); // note: this is affects tests that comes after this so for now putting this test last
    const mockRouterPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
    });

    render(<AddToCartButton item={mockItem} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/sign-in");
    });
  });
});
