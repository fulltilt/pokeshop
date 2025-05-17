import { prismaClient } from "@/db";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { auth } from "@clerk/nextjs/server";

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const cart = await prismaClient.cart.findUnique({
    where: { userId: userId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  const cartItems = cart?.items || [];
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Checkout</h2>
      <CheckoutForm cartItems={cartItems} totalPrice={totalPrice} />
    </div>
  );
}
