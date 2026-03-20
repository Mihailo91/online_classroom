import Link from "next/link";
import { auth } from "@/auth";
import { getRoleBasedRedirect } from "@/lib/auth-helpers";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Online Language School
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Learn languages with expert instructors
        </p>

        {session?.user ? (
          <div className="space-y-4">
            <p className="text-gray-700">
              Welcome back, <strong>{session.user.name}</strong>!
            </p>
            <Link
              href={getRoleBasedRedirect(session.user.role)}
              className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              href="/login"
              className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-block rounded-md border-2 border-blue-600 px-6 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
