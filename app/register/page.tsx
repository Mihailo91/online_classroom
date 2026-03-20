import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRoleBasedRedirect } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Register | Online Language School",
  description: "Create your account to start learning",
};

export default async function RegisterPage() {
  // Redirect if already logged in
  const session = await auth();
  if (session?.user) {
    const redirectPath = getRoleBasedRedirect(session.user.role);
    redirect(redirectPath);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start your language learning journey today
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
