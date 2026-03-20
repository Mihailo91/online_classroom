import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Require specific role - redirects to appropriate dashboard if unauthorized
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard
    switch (user.role) {
      case "student":
        redirect("/dashboard");
      case "professor":
        redirect("/professor/dashboard");
      case "admin":
        redirect("/admin/dashboard");
      default:
        redirect("/");
    }
  }
  
  return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole) {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * Get redirect path based on user role
 */
export function getRoleBasedRedirect(role: UserRole): string {
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
