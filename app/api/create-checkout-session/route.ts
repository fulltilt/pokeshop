import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { prismaClient } from "@/db";
import { getAuth } from "@clerk/nextjs/server";

const stripe = new Stripe(`${process.env.STRIPE_SECRET_KEY!}`, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items, customer } = await req.json();

    // Create order in database
    const order = await prismaClient.order.create({
      data: {
        user: {
          connect: { id: userId },
        },
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
          unit_amount: Math.round(item.item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${req.headers.get(
        "origin"
      )}/thank-you?stripeSessionId={CHECKOUT_SESSION_ID}&orderId=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      customer_email: customer.email,
      metadata: {
        orderId: order.id.toString(),
        testMetadata: "true",
      },
    });

    return NextResponse.json({
      stripeSessionId: stripeSession.id,
      orderId: order.id,
    });
  } catch (e) {
    console.error("Checkout error:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
