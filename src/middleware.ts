import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/search", "/player", "/replacement"];

// Routes that we should not redirect from if user is not authenticated
const PUBLIC_ROUTES = [
  "/",
  "/api/auth/login",
  "/api/auth/callback",
  "/auth/error",
];

/**
 * Middleware to handle authentication for protected routes.
 * Since we can't directly check cookies in middleware (due to async limitations),
 * we'll implement a different strategy:
 *
 * 1. API routes will handle their own authentication
 * 2. For protected routes, redirect to the login page
 * 3. After login, our API routes will handle auth state
 */
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Redirect dashboard to search (since we've merged them)
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/search", request.url));
  }

  // Allow public routes and API routes (they handle their own auth)
  if (
    PUBLIC_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check if the request is for a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    // For protected routes, check a cookie to see if user is logged in
    // This is a simplified check - the actual auth state is managed by the API routes
    const hasAuthCookie = request.cookies.has("spotify_access_token");

    if (!hasAuthCookie) {
      // Redirect to login page if no auth cookie exists
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files, but include everything else
    "/((?!favicon.ico|images).*)",
  ],
};
