import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prismaClient } from "@/db";
import { sendOrderConfirmationEmail } from "../../../../lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.log("webhook error", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // if (event.type === 'payment_intent.succeeded')
  // if (event.type === 'payment_intent.payment_failed')
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update order status to PAID
    await prismaClient.order.update({
      where: { id: Number.parseInt(session.metadata!.orderId!) },
      data: { status: "PAID" },
    });

    // Update inventory
    let order = await prismaClient.order.findUnique({
      where: { id: Number.parseInt(session.metadata!.orderId!) },
      include: { items: true },
    });
    console.log("order", order);

    if (order) {
      // Ensure the cart is cleared after successful payment
      if (order.userId) {
        await prismaClient.cartItem.deleteMany({
          where: { cart: { userId: order.userId } },
        });
      }

      for (const item of order.items) {
        const res = await prismaClient.item.update({
          where: { id: item.itemId },
          data: { quantity: { decrement: item.quantity } },
        });

        // add name data to the line items
        order = {
          ...order,
          items: order.items.map((i) =>
            i.itemId === item.itemId ? { ...i, name: res.name } : i
          ),
        };

        // Send payment confirmation email
        await sendOrderConfirmationEmail(order.email, {
          ...order,
          paymentStatus: "Paid",
        });
      }
    } else {
      console.log("Order not found");
    }
  }

  return NextResponse.json({ received: true });
}
