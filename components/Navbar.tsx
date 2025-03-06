"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useCart } from "./CartProvider";
import { ShoppingCart } from "lucide-react";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function Navbar({ user }: { user: User | undefined }) {
  const { cartItemsCount } = useCart();

  return (
    <header
      className="bg-primary text-primary-foreground p-4
    sticky top-0 z-50 border-b border-border "
    >
      <nav className="mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Pokémon Singles
        </Link>
        <ul className="flex gap-4 items-center">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/items" className="hover:underline">
              All Items
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/profile" className="hover:underline">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:underline relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </li>
              {user.email === "admin@example.com" && (
                <li>
                  <Link href="/admin/dashboard" className="hover:underline">
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <Button variant="secondary" onClick={() => signOut()}>
                  Logout
                </Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login" className="hover:underline">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:underline">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
