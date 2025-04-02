// import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/lib/auth"
import { prismaClient } from "@/db";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { auth } from "@/lib/auth";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/sign-in");
  }

  const userId = session?.user?.id;

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
