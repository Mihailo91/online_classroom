import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function StudentLessonsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/lessons");
  }

  // Fetch all student's lessons
  const allLessons = await prisma.lesson.findMany({
    where: {
      studentId: session.user.id,
    },
    include: {
      professor: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { scheduledAt: "desc" },
  });

  // Group lessons by status
  const upcomingLessons = allLessons.filter(
    (l) => l.status === "scheduled" && l.scheduledAt > new Date()
  );
  const pastLessons = allLessons.filter(
    (l) =>
      (l.status === "completed" && l.scheduledAt <= new Date()) ||
      (l.status === "scheduled" && l.scheduledAt <= new Date())
  );
  const cancelledLessons = allLessons.filter((l) => l.status === "cancelled");

  // Fetch active packages for context
  const activePackages = await prisma.studentPackage.findMany({
    where: {
      studentId: session.user.id,
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
        },
      },
    },
    orderBy: { expiresAt: "asc" },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCancellationTypeLabel = (type?: string | null) => {
    if (!type) return null;
    switch (type) {
      case "on_time":
        return "Cancelled (on time)";
      case "late":
        return "Cancelled (late)";
      case "by_professor":
        return "Cancelled by professor";
      case "by_admin":
        return "Cancelled by admin";
      default:
        return "Cancelled";
    }
  };

  const LessonCard = ({ lesson }: { lesson: (typeof allLessons)[0] }) => (
    <div className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{lesson.professor.name}</h3>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                lesson.status
              )}`}
            >
              {lesson.status === "cancelled"
                ? getCancellationTypeLabel(lesson.cancellationType)
                : lesson.status === "completed"
                ? "Completed"
                : "Scheduled"}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {new Date(lesson.scheduledAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {lesson.notes && (
            <p className="mt-2 text-sm text-gray-600">
              <strong>Notes:</strong> {lesson.notes}
            </p>
          )}
          {lesson.cancelledReason && (
            <p className="mt-2 text-sm text-red-600">
              <strong>Reason:</strong> {lesson.cancelledReason}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{lesson.durationMin} min</p>
          {lesson.status === "scheduled" && lesson.scheduledAt > new Date() && (
            <p className="mt-1 text-xs text-amber-600">
              {Math.ceil(
                (lesson.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )}{" "}
              days away
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Lessons</h1>
              <p className="mt-2 text-gray-600">
                Manage your 1-on-1 lessons and packages
              </p>
            </div>
            <Link
              href="/lessons"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Book Lesson
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Lessons */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Upcoming Lessons ({upcomingLessons.length})
                </h2>
              </div>

              {upcomingLessons.length === 0 ? (
                <div className="rounded-lg bg-white p-12 text-center shadow-sm">
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
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No upcoming lessons
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Book a lesson with one of our professors to get started.
                  </p>
                  <Link
                    href="/lessons"
                    className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700"
                  >
                    Browse Professors
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              )}
            </section>

            {/* Past Lessons */}
            {pastLessons.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Past Lessons ({pastLessons.length})
                </h2>
                <div className="space-y-4">
                  {pastLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled Lessons */}
            {cancelledLessons.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  Cancelled Lessons ({cancelledLessons.length})
                </h2>
                <div className="space-y-4">
                  {cancelledLessons.map((lesson) => (
                    <LessonCard key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Packages Summary */}
            <section className="rounded-lg bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-semibold text-gray-900">
                  Active Packages ({activePackages.length})
                </h3>
              </div>

              {activePackages.length === 0 ? (
                <div className="px-6 py-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    No active packages. Purchase one to book lessons.
                  </p>
                  <Link
                    href="/lessons"
                    className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Buy a package
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {activePackages.map((pkg) => {
                    const remaining = pkg.totalLessons - pkg.usedLessons;

                    return (
                      <div key={pkg.id} className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {pkg.package.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {pkg.professor.name}
                        </p>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Used</span>
                            <span className="font-semibold text-gray-900">
                              {pkg.usedLessons} / {pkg.totalLessons}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{
                                width: `${
                                  (pkg.usedLessons / pkg.totalLessons) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {remaining} remaining
                        </p>
                        {pkg.expiresAt && (
                          <p className="text-xs text-amber-600 mt-1">
                            Expires:{" "}
                            {new Date(pkg.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Help Section */}
            <section className="rounded-lg bg-blue-50 px-6 py-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900">Need help?</h3>
              <p className="mt-2 text-sm text-blue-800">
                Contact your professor or support team for assistance with lesson
                scheduling.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
