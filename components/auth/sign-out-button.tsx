"use client";

import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  variant?: "default" | "compact";
}

export function SignOutButton({ variant = "default" }: SignOutButtonProps) {
  const className =
    variant === "compact"
      ? "rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-600 hover:text-red-600"
      : "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2";

  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className}
    >
      Sign Out
    </button>
  );
}
