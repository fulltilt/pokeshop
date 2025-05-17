import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received eBay webhook:", JSON.stringify(body, null, 2));

    // Optional: Validate eBay payload here
    // if (!body?.metadata?.marketplaceId) {
    //   return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    // }

    // Process the payload as needed
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
