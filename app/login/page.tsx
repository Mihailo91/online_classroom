import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRoleBasedRedirect } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Login | Online Language School",
  description: "Sign in to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  // Redirect if already logged in
  const session = await auth();
  if (session?.user) {
    const params = await searchParams;
    const redirectPath = params.callbackUrl || getRoleBasedRedirect(session.user.role);
    redirect(redirectPath);
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to Online Language School
          </p>
        </div>
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  );
}
