import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SITE_DISABLED } from "@/lib/site-config";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/preview(.*)", "/admin(.*)"]);
const isSignUpRoute = createRouteMatcher(["/sign-up(.*)"]);
const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY;

export default clerkMiddleware(
  async (auth, request) => {
    // Parked-site mode: block new account creation entirely. The owner can still
    // reach /sign-in directly (it is just unlinked) and use the protected dashboard.
    if (SITE_DISABLED && isSignUpRoute(request)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (isProtectedRoute(request)) {
      await auth.protect();
    }
  },
  {
    publishableKey: clerkPublishableKey
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)"
  ]
};
