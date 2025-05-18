import { Webhook } from 'svix';
import { prismaClient } from "@/db";
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.text();
  const svix_id = req.headers.get("svix-id")!;
  const svix_timestamp = req.headers.get("svix-timestamp")!;
  const svix_signature = req.headers.get("svix-signature")!;
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  if (eventType === "user.created") {
    const user = evt.data;

    await prismaClient.user.create({
      data: {
        id: user.id,
        email: user.email_addresses[0]?.email_address,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        image: user.image_url,
        emailVerified: new Date(user.created_at),
      },
    });
  }

  return new NextResponse("OK", { status: 200 });
}
