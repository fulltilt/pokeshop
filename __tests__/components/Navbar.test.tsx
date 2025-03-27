import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import "@testing-library/jest-dom";

// Mock the useCart hook
jest.mock("@/components/CartProvider", () => ({
  ...jest.requireActual("@/components/CartProvider"),
  useCart: () => ({
    cartItemsCount: 3,
    updateCartItemsCount: jest.fn(),
    clearCart: jest.fn(),
    isLoading: false,
  }),
}));

// Mock the useSession hook
jest.mock("next-auth/react", () => ({
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
  signOut: jest.fn(),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it("renders the logo and navigation links", () => {
    render(<Navbar />);

    // Check for logo
    expect(screen.getByText("DJCollects")).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("All Items")).toBeInTheDocument();
  });

  it("shows user menu when user is logged in", () => {
    render(<Navbar />);

    // Cart icon should be visible
    expect(screen.getByRole("link", { name: /cart/i })).toBeInTheDocument();
  });

  it("shows admin link when user is an admin", () => {
    // Mock admin session
    const useSessionMock = jest.requireMock("next-auth/react").useSession;
    useSessionMock.mockReturnValueOnce({
      data: {
        user: {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "ADMIN",
        },
        expires: new Date(Date.now() + 2 * 86400).toISOString(),
      },
      status: "authenticated",
    });

    render(<Navbar />);

    // Admin link should be visible
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows cart badge with correct count", () => {
    render(<Navbar />);

    // Cart badge should show the count from useCart
    const element = screen.getByTestId("d-cart-quantity");
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent("3");
  });
});
