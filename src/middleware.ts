import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only sign-in and sign-up pages are public
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    // In @clerk/nextjs v5, `auth` is a getter function — call auth() to get the object
    auth().protect(); // redirects to /sign-in if not authenticated
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
