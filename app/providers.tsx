"use client";

import { Suspense } from "react";
import { CartProvider } from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from '@clerk/nextjs'
import Link from "next/link";
import { Toaster } from "sonner";
import TopLoader from "@/components/TopLoader";
import { LoadingProvider } from "@/components/LoadingProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <CartProvider>
        <Suspense fallback={null}>
          <LoadingProvider>
            <TopLoader />
            <Navbar />
            {/* <main className="h-screen flex justify-center py-8"> */}
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="flex gap-8 justify-center bg-muted text-muted-foreground p-4 mt-auto">
              <div className=" ">© 2025 DJCollects. All rights reserved.</div>
              <Link href="/return-policy">Return Policy</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </footer>
          </LoadingProvider>
          <Toaster />
        </Suspense>
      </CartProvider>
    </ClerkProvider>
  );
}
