import { POST as addToCart } from "@/app/api/cart/add/route";
import { POST as removeFromCart } from "@/app/api/cart/remove/route";
import { POST as updateQuantity } from "@/app/api/cart/update-quantity/route";
import { prismaClient } from "@/db";

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
        name: "Test User",
        email: "test@example.com",
        role: "CUSTOMER",
      },
    })
  ),
}));

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  prismaClient: {
    item: {
      findUnique: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Helper to create a mock request
const createMockRequest = (body: any) => {
  return {
    json: () => Promise.resolve(body),
  } as unknown as Request;
};

describe("Cart API Operations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Add to Cart", () => {
    it("adds a new item to the cart", async () => {
      // Mock item exists and has stock
      prismaClient.item.findUnique.mockResolvedValue({
        id: 1,
        name: "Pikachu",
        inStock: 10,
      });

      // Mock cart exists
      prismaClient.cart.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        items: [],
      });

      // Mock item creation
      prismaClient.cartItem.create.mockResolvedValue({
        id: 1,
        cartId: 1,
        cardId: 1,
        quantity: 2,
      });

      const req = createMockRequest({ cardId: 1, quantity: 2 });
      const res = await addToCart(req);
      const data = await res.json();

      expect(data).toEqual({ success: true });
      expect(prismaClient.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 1,
          cardId: 1,
          quantity: 2,
        },
      });
    });
  });

  describe("Remove from Cart", () => {
    it("removes an item from the cart", async () => {
      // Mock cart exists
      prismaClient.cart.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        items: [{ id: 1, cardId: 1, quantity: 2 }],
      });

      // Mock item deletion
      prismaClient.cartItem.delete.mockResolvedValue({});

      const req = createMockRequest({ itemId: 1 });
      const res = await removeFromCart(req);
      const data = await res.json();

      expect(data).toEqual({ success: true });
      expect(prismaClient.cartItem.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe("Update Quantity", () => {
    it("updates the quantity of an item in the cart", async () => {
      // Mock cart exists
      prismaClient.cart.findUnique.mockResolvedValue({
        id: 1,
        userId: 1,
        items: [{ id: 1, cardId: 1, quantity: 2 }],
      });

      // Mock item update
      prismaClient.cartItem.update.mockResolvedValue({
        id: 1,
        cartId: 1,
        cardId: 1,
        quantity: 3,
      });

      const req = createMockRequest({ itemId: 1, quantity: 3 });
      const res = await updateQuantity(req);
      const data = await res.json();

      expect(data).toEqual({
        success: true,
        item: {
          id: 1,
          cartId: 1,
          cardId: 1,
          quantity: 3,
        },
      });
      expect(prismaClient.cartItem.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { quantity: 3 },
      });
    });
  });
});
