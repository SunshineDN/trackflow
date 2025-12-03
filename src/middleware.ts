import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isProfileComplete = token?.isProfileComplete;
    const path = req.nextUrl.pathname;

    // If user is logged in but profile is incomplete, redirect to complete profile page
    // Avoid redirect loop if already on the complete profile page
    if (token && !isProfileComplete && path !== "/auth/complete-profile") {
      return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
    }

    // If user is logged in and profile IS complete, but tries to access complete profile page, redirect to home
    if (token && isProfileComplete && path === "/auth/complete-profile") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - auth/login (login page)
     * - auth/register (register page)
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!auth/login|auth/register|api|_next/static|_next/image|favicon.ico).*)",
  ],
};
