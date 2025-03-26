import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prismaClient } from "@/db";
import { auth } from "../../../lib/auth";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  if (req.method === "POST") {
    try {
      const { items, customer } = await req.json();

      // Get the user session
      const session = await auth();

      const userId = session?.user?.id;

      // Create order in database
      const order = await prismaClient.order.create({
        data: {
          user: {
            connect: { id: userId },
          },
          // userId: userId, // Use 0 for guest orders
          name: customer.name,
          email: customer.email,
          address: customer.address,
          city: customer.city,
          country: customer.country,
          zipCode: customer.zipCode,
          total: items.reduce(
            (total: number, item: any) =>
              total + item.item.price * item.quantity,
            0
          ),
          items: {
            create: items.map((item: any) => ({
              itemId: item.itemId,
              // name: item.name,
              quantity: item.quantity,
              price: item.item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Create Stripe checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.item.name,
            },
            unit_amount: Math.round(item.item.price * 100), // Stripe expects amounts in cents
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${req.headers.get(
          "origin"
        )}/thank-you?session_id={CHECKOUT_SESSION_ID}&orderId=${order.id}`,
        cancel_url: `${req.headers.get("origin")}/checkout`,
        customer_email: customer.email,
        metadata: {
          orderId: order.id.toString(),
        },
      });

      return NextResponse.json({ sessionId: stripeSession.id });
    } catch (e) {
      // console.log(e.stack);
      return NextResponse.json({ error: e }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
}
