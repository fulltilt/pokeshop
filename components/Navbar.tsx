// "use client";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { signOut } from "next-auth/react";
// import { useCart } from "./CartProvider";
// import { ShoppingCart } from "lucide-react";

// type User = {
//   name?: string | null;
//   email?: string | null;
//   image?: string | null;
// };

// export default function Navbar({ user }: { user: User | undefined }) {
//   const { cartItemsCount } = useCart();

//   return (
//     <header
//       className="bg-primary text-primary-foreground p-4
//     sticky top-0 z-50 border-b border-border "
//     >
//       <nav className="mx-auto flex justify-between items-center">
//         <Link href="/" className="text-2xl font-bold">
//           Pokémon Singles
//         </Link>
//         <ul className="flex gap-4 items-center">
//           <li>
//             <Link href="/" className="hover:underline">
//               Home
//             </Link>
//           </li>
//           <li>
//             <Link href="/items" className="hover:underline">
//               All Items
//             </Link>
//           </li>
//           {user ? (
//             <>
//               <li>
//                 <Link href="/profile" className="hover:underline">
//                   Profile
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/cart" className="hover:underline relative">
//                   <ShoppingCart className="h-6 w-6" />
//                   {cartItemsCount > 0 && (
//                     <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                       {cartItemsCount}
//                     </span>
//                   )}
//                 </Link>
//               </li>
//               {user.email === "admin@example.com" && (
//                 <li>
//                   <Link href="/admin/dashboard" className="hover:underline">
//                     Admin
//                   </Link>
//                 </li>
//               )}
//               <li>
//                 <Button variant="secondary" onClick={() => signOut()}>
//                   Logout
//                 </Button>
//               </li>
//             </>
//           ) : (
//             <>
//               <li>
//                 <Link href="/login" className="hover:underline">
//                   Login
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/register" className="hover:underline">
//                   Register
//                 </Link>
//               </li>
//             </>
//           )}
//         </ul>
//       </nav>
//     </header>
//   );
// }

"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
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

export default function Navbar({
  user,
}: {
  user:
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role?: string | null;
      }
    | undefined;
}) {
  const { cartItemsCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  console.log(user);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    // <header className="sticky top-0 z-50 bg-background border-b border-border p-4">
    <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50 border-b border-border">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl md:text-2xl font-bold">
          Pokémon Singles
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <Link
            href="/cards"
            className="hover:underline flex items-center gap-1"
          >
            <Package className="h-4 w-4" />
            <span>All Cards</span>
          </Link>

          {user ? (
            <>
              <Link href="/cart" className="hover:underline relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="hover:underline flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.name || user.email}
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
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          {user && (
            <Link href="/cart" className="hover:underline relative mr-2">
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          )}

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
        <div className="md:hidden bg-primary border-t border-border text-primary-foreground">
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
              href="/cards"
              className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
              onClick={closeMenu}
            >
              <Package className="h-5 w-5" />
              <span>All Cards</span>
            </Link>

            {user ? (
              <>
                {user.role === "ADMIN" && (
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
                  href="/login"
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                  onClick={closeMenu}
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
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
