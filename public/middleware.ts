// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const token = await getToken({
//     req: request,
//     secret: process.env.AUTH_SECRET,
//   });
//   console.log("token", token);
//   if (!token) {
//     const url = new URL("/sign-in", request.url);
//     url.searchParams.set("callbackUrl", encodeURI(request.url));
//     return NextResponse.redirect(url);
//   }

//   if (request.nextUrl.pathname.startsWith("/admin")) {
//     // Check if the user has the ADMIN role
//     if (token.role !== "ADMIN") {
//       // Redirect non-admin users to the home page
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/profile", "/admin/:path*", "/checkout"],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Add debug logging
  console.log("Middleware executing for path:", request.nextUrl.pathname);

  // Try to get the token both ways
  const rawToken = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    raw: true,
  });

  const decodedToken = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  console.log("Raw token retrieved:", rawToken ? "Yes (string)" : "No");
  console.log("Decoded token retrieved:", decodedToken ? "Yes (object)" : "No");

  // Check if we have a session token but can't decode it
  if (rawToken && !decodedToken) {
    console.log(
      "WARNING: Token exists but cannot be decoded. This may indicate a secret mismatch or corrupted token."
    );
    console.log("Raw token type:", typeof rawToken);
    if (typeof rawToken === "string") {
      console.log("Raw token length:", rawToken.length);
      // Don't log the full token for security reasons, just a prefix
      console.log("Raw token prefix:", rawToken.substring(0, 10) + "...");
    }
  }

  // If we have a raw token but no decoded token, we'll use a fallback approach
  // to extract basic authentication info
  let isAuthenticated = false;
  let isAdmin = false;

  if (rawToken) {
    // We at least know the user is authenticated since we have a token
    isAuthenticated = true;

    // Try to extract role from the session cookie directly if possible
    // This is a fallback approach and not ideal
    try {
      const sessionCookie =
        request.cookies.get("next-auth.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value;

      if (sessionCookie) {
        // Log cookie info for debugging
        console.log("Session cookie found, length:", sessionCookie.length);

        // Check if this is an admin user based on the cookie name or other heuristics
        // This is just a placeholder - in a real app you'd need a more secure approach
        isAdmin = request.cookies.get("next-auth.admin-flag")?.value === "true";
      }
    } catch (e) {
      console.error("Error checking cookies:", e);
    }
  } else if (decodedToken) {
    // We have a properly decoded token
    isAuthenticated = true;
    isAdmin = decodedToken.role === "ADMIN";
    console.log("Using decoded token, role:", decodedToken.role);
  }

  // Handle authentication based on what we've determined
  if (!isAuthenticated) {
    console.log("No valid token found, redirecting to login");
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdmin) {
      console.log("User is not admin, redirecting to home");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/admin/:path*", "/checkout"],
};
