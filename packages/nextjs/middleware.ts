import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Wagmi typically stores state in a cookie named 'wagmi.store'
  const authCookie = request.cookies.get("wagmi.store");

  // Check if the user is trying to access a protected route without a session
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!authCookie) {
      // Redirect to home or a custom login page
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      const parsed = JSON.parse(authCookie.value);
      const state = parsed.state;

      // Wagmi stores connections as a Map converted to an array of pairs
      // If "value" is empty [], no one is signed in.
      const hasConnections = state.connections?.value?.length > 0;
      const hasCurrentAccount = !!state.current;

      if (!hasConnections && !hasCurrentAccount) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (e) {
      console.log(e);
      // If JSON is malformed, treat as signed out
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Limit the middleware to specific paths for better performance
export const config = {
  matcher: ["/dashboard/:path*"],
};
