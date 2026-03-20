import Link from "next/link";
import { auth } from "@/auth";
import { getRoleBasedRedirect } from "@/lib/auth-helpers";
import { CourseShowcase } from "@/components/home/course-showcase";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4 py-24">
        <div className="container mx-auto text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Learn with confidence
          </p>
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
            Online Language School
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-600 md:text-xl">
            Learn languages with expert instructors through self-paced video
            courses and personalized private lessons.
          </p>

          {session?.user ? (
            <div className="space-y-5">
              <p className="text-gray-700">
                Welcome back, <strong>{session.user.name}</strong>!
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={getRoleBasedRedirect(session.user.role)}
                  className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/courses"
                  className="inline-block rounded-md border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-blue-600 hover:text-blue-600"
                >
                  Explore Courses
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Explore Courses
              </Link>
              <Link
                href="/lessons"
                className="inline-block rounded-md border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                Private Lessons
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Courses */}
      <CourseShowcase />
    </div>
  );
}
