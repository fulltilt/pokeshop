import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const itemSchema = z.object({
  name: z.string().min(3),
  image: z.string().url(),
  price: z.number(),
  description: z.string(),
  quantity: z.number(),
});

export const orderSchema = z.object({
  id: z.number(),
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string(),
  total: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  items: z.array(
    z.object({
      id: z.number(),
      orderId: z.number(),
      itemId: z.number(),
      quantity: z.number(),
      price: z.number(),
      item: z.object({
        id: z.number(),
        name: z.string(),
        image: z.string(),
        price: z.number(),
        description: z.string(),
        quantity: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
      }),
    })
  ),
});
