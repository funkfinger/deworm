import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/app/lib/session";

/**
 * Route handler for logging out the user.
 * Clears all authentication cookies and redirects to the home page.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Clear all authentication cookies
  await clearSession();

  // Redirect to the home page
  return NextResponse.redirect(new URL("/", request.url));
}
