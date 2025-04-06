"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartProvider";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Home,
  Package,
  Settings,
  UserCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchBar } from "./SearchBar";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { cartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50 border-b border-border">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-bold">
          DJCollects
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            href="/items"
            className="hover:underline flex items-center gap-1"
          >
            <Package className="h-4 w-4" />
            <span>All Items</span>
          </Link>

          <SearchBar />

          {/* Admin Link - Reserve space even when loading */}
          <div className="w-[76px]">
            {" "}
            {/* Approximate width of Admin link */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="hover:underline flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Cart Icon - Always render to maintain layout */}
          <div className="relative">
            {(isAuthenticated || isLoading) && (
              <Link href="/cart" className="hover:underline relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    data-testid="d-cart-quantity"
                    aria-label="cart"
                  >
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* User Menu or Auth Links - Always render with consistent width */}
          <div className="min-w-[100px] flex justify-end">
            {isLoading ? (
              <div className="w-5 h-5 rounded-full animate-pulse bg-primary-foreground/30"></div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="cursor-pointer rounded-full border-solid border-1 border-white">
                    <User className="h-5 w-5" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {session?.user?.name || session?.user?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/sign-in" className="hover:underline">
                  Login
                </Link>
                <Link href="/sign-up" className="hover:underline">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden gap-2">
          {/* Cart Icon - Always render with consistent width for mobile */}
          <div className="w-6 relative">
            {(isAuthenticated || isLoading) && (
              <Link href="/cart" className="hover:underline relative mr-2">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          <SearchBar />

          <Button variant="ghost" size="icon" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-border text-primary-foreground mt-2">
          <div className="container mx-auto py-4 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={closeMenu}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/items"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={closeMenu}
            >
              <Package className="h-5 w-5" />
              <span>All Items</span>
            </Link>

            {isLoading ? (
              <div className="p-2">
                <div className="h-5 w-32 bg-primary-foreground/30 animate-pulse rounded"></div>
              </div>
            ) : isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                    onClick={closeMenu}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                  onClick={closeMenu}
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={() => {
                    signOut();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                  onClick={closeMenu}
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                  onClick={closeMenu}
                >
                  <User className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
