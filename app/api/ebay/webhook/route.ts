import type { NextApiRequest, NextApiResponse } from "next";

// Optional: Secure your endpoint using headers (eBay may sign requests in future)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return res.status(200).json({ message: "User deletion handled" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, eventType } = req.body;

    // Validate payload structure
    if (!userId || eventType !== "USER_ACCOUNT_DELETION") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // TODO: Delete or anonymize user data associated with this eBay userId
    console.log(`Deleting data for eBay user: ${userId}`);

    // You could call your Prisma DB to anonymize/delete the data:
    // await prisma.user.delete({ where: { ebayUserId: userId } });

    return res.status(200).json({ message: "User deletion handled" });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
