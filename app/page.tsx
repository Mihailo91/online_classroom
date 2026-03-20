import Link from "next/link";
import { auth } from "@/auth";
import { getRoleBasedRedirect } from "@/lib/auth-helpers";
import { CourseShowcase } from "@/components/home/course-showcase";
import { PrivateLessonsCTA } from "@/components/home/private-lessons-cta";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-20">
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            Online Language School
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Learn languages with expert instructors through video courses and
            private lessons
          </p>

          {session?.user ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Welcome back, <strong>{session.user.name}</strong>!
              </p>
              <Link
                href={getRoleBasedRedirect(session.user.role)}
                className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-block rounded-md border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <CourseShowcase />

      {/* Private Lessons CTA */}
      <PrivateLessonsCTA />
    </div>
  );
}
