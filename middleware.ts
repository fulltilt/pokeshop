import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Mark routes that should be public (not protected)
const isPublicRoute = createRouteMatcher([
  "/",                    // homepage
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",
  "/sign-in(.*)",         // catch all subpaths under sign-in
  "/sign-up(.*)",         // catch all subpaths under sign-up
  "/api/public(.*)",      // any public APIs
]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  return auth().then(({ userId }) => {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  });
});

export const config = {
  matcher: [
    // Match all routes EXCEPT static assets and API routes you handle manually
    "/((?!_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|js|css|woff2?|ttf|eot)).*)",
  ],
};
