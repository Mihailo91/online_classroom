import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function StudentDashboard() {
  const user = await requireRole(["student"]);

  // Fetch student's purchased courses (count)
  const courseCount = await prisma.studentCourse.count({
    where: { studentId: user.id },
  });

  // Fetch active lesson packages
  const activePackages = await prisma.studentPackage.findMany({
    where: {
      studentId: user.id,
      status: "active",
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      package: true,
      professor: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      lessons: {
        where: { status: "scheduled" },
      },
    },
    orderBy: { expiresAt: "asc" },
    take: 5,
  });

  // Fetch upcoming lessons
  const upcomingLessons = await prisma.lesson.findMany({
    where: {
      studentId: user.id,
      status: "scheduled",
      scheduledAt: {
        gte: new Date(),
      },
    },
    include: {
      professor: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      student: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  // Fetch recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate stats
  const totalLessonsUsed = activePackages.reduce(
    (sum, pkg) => sum + pkg.usedLessons,
    0
  );
  const totalLessonsRemaining = activePackages.reduce(
    (sum, pkg) => sum + (pkg.totalLessons - pkg.usedLessons),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
          </div>
          <SignOutButton />
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{courseCount}</p>
              </div>
              <svg
                className="h-12 w-12 text-blue-600 opacity-20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.669 0-3.218.51-4.5 1.385A7.968 7.968 0 009 4.804z" />
              </svg>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Packages Active</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {activePackages.length}
                </p>
              </div>
              <svg
                className="h-12 w-12 text-green-600 opacity-20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 3.062v6.218c0 1.265-.933 2.321-2.278 2.434a5.973 5.973 0 01-.978 6.455 3.066 3.066 0 01-2.812 1.562 3.065 3.065 0 01-2.812-1.562 5.973 5.973 0 01-.978-6.455 2.422 2.422 0 01-2.278-2.434V6.517a3.066 3.066 0 012.812-3.062zM9 7a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lessons Used</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalLessonsUsed}
                </p>
              </div>
              <svg
                className="h-12 w-12 text-purple-600 opacity-20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {totalLessonsRemaining}
                </p>
              </div>
              <svg
                className="h-12 w-12 text-orange-600 opacity-20"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Lessons and Packages */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Lessons */}
            <section className="rounded-lg bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 sm:flex sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Lessons
                </h2>
                <Link
                  href="/dashboard/lessons"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all →
                </Link>
              </div>

              {upcomingLessons.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-600">No upcoming lessons scheduled</p>
                  <Link
                    href="/lessons"
                    className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Book a lesson
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcomingLessons.map((lesson) => (
                    <div key={lesson.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                              <svg
                                className="h-5 w-5 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {lesson.professor.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(lesson.scheduledAt).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                            Scheduled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Active Packages */}
            <section className="rounded-lg bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 sm:flex sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Packages
                </h2>
                <Link
                  href="/lessons"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Buy more →
                </Link>
              </div>

              {activePackages.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="mt-2 text-gray-600">
                    No active packages
                  </p>
                  <Link
                    href="/lessons"
                    className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Browse packages
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {activePackages.map((pkg) => {
                    const remaining = pkg.totalLessons - pkg.usedLessons;
                    const percent = Math.round((pkg.usedLessons / pkg.totalLessons) * 100);
                    const daysRemaining = Math.ceil(
                      (pkg.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div key={pkg.id} className="px-6 py-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {pkg.package.name} with {pkg.professor.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires in {daysRemaining} days
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {remaining} left
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {pkg.usedLessons} / {pkg.totalLessons} used ({percent}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Quick Actions & Transactions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <section className="rounded-lg bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/dashboard/courses"
                  className="block rounded-lg border border-gray-300 px-4 py-3 text-center font-medium text-gray-900 hover:bg-gray-50"
                >
                  My Courses
                </Link>
                <Link
                  href="/lessons"
                  className="block rounded-lg border border-gray-300 px-4 py-3 text-center font-medium text-gray-900 hover:bg-gray-50"
                >
                  Book Lesson
                </Link>
                <Link
                  href="/courses"
                  className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
                >
                  Browse Courses
                </Link>
              </div>
            </section>

            {/* Recent Transactions */}
            <section className="rounded-lg bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Purchases
                </h2>
              </div>

              {recentTransactions.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-600">
                    No purchases yet
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                  {recentTransactions.map((txn) => (
                    <div key={txn.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {txn.referenceType}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            €{Number(txn.amount).toFixed(2)}
                          </p>
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                              txn.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : txn.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
