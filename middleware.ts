import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const token = req.auth;
  const isLoggedIn = !!token?.user;
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/courses", "/lessons"];
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // API routes for courses are public
  if (pathname.startsWith("/api/courses") && req.method === "GET") {
    return NextResponse.next();
  }

  // Auth API routes are always accessible
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute && !isLoggedIn) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (isLoggedIn && token.user) {
    const role = token.user.role;

    // Student routes
    if (pathname.startsWith("/dashboard") && role !== "student") {
      return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
    }

    // Professor routes
    if (pathname.startsWith("/professor") && role !== "professor") {
      return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
    }

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
    }

    // Redirect logged-in users away from auth pages
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL(getRoleRedirect(role), req.url));
    }
  }

  return NextResponse.next();
});

function getRoleRedirect(role: string): string {
  switch (role) {
    case "student":
      return "/dashboard";
    case "professor":
      return "/professor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
