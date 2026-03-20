import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function MyCoursesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/courses");
  }

  // Fetch purchased courses
  const purchasedCourses = await prisma.studentCourse.findMany({
    where: {
      studentId: session.user.id,
    },
    include: {
      course: {
        include: {
          modules: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });

  // Fetch progress for all modules
  const courseIds = purchasedCourses.map((pc) => pc.course.id);
  const allProgress = await prisma.studentModuleProgress.findMany({
    where: {
      studentId: session.user.id,
      module: {
        courseId: {
          in: courseIds,
        },
      },
    },
    select: {
      moduleId: true,
      completed: true,
    },
  });

  // Create a map of module completions
  const progressMap = new Map(
    allProgress.map((p) => [p.moduleId, p.completed])
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">
            Continue learning from where you left off
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {purchasedCourses.length === 0 ? (
          // Empty state
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              No courses yet
            </h2>
            <p className="mt-2 text-gray-600">
              Browse our course catalog and start learning today!
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          // Course grid
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {purchasedCourses.map((purchase) => {
              const totalModules = purchase.course.modules.length;
              const completedModules = purchase.course.modules.filter((m) =>
                progressMap.get(m.id)
              ).length;
              const progressPercent =
                totalModules > 0
                  ? Math.round((completedModules / totalModules) * 100)
                  : 0;

              return (
                <div
                  key={purchase.id}
                  className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Course Info */}
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                      {purchase.course.title}
                    </h3>

                    {purchase.course.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {purchase.course.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-gray-600">
                          {completedModules} / {totalModules} modules
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="mt-1 text-right text-xs text-gray-500">
                        {progressPercent}% complete
                      </div>
                    </div>

                    {/* Purchased date */}
                    <div className="mb-4 text-xs text-gray-500">
                      Purchased{" "}
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </div>

                    {/* Action button */}
                    <Link
                      href={`/dashboard/courses/${purchase.course.id}`}
                      className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white hover:bg-blue-700"
                    >
                      {completedModules === 0
                        ? "Start Learning"
                        : completedModules === totalModules
                        ? "Review Course"
                        : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
