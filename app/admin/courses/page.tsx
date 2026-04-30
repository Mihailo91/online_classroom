import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { CourseStatusBadge } from "@/components/admin/courses/course-status-badge";

export default async function AdminCoursesPage() {
  await requireRole(["admin"]);

  const courses = await prisma.videoCourse.findMany({
    include: {
      modules: { select: { id: true, durationSec: true } },
      _count: { select: { studentCourses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      const revenue = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          referenceType: "course",
          referenceId: course.id,
          status: "completed",
        },
      });
      return {
        ...course,
        moduleCount: course.modules.length,
        enrollmentCount: course._count.studentCourses,
        revenue: revenue._sum.amount || 0,
      };
    })
  );

  const totalCourses = coursesWithStats.length;
  const publishedCourses = coursesWithStats.filter((c) => c.isPublished).length;
  const draftCourses = totalCourses - publishedCourses;
  const totalRevenue = coursesWithStats.reduce((sum, c) => sum + Number(c.revenue), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
              <p className="mt-2 text-gray-600">Create, edit, and publish video courses</p>
            </div>
            <Link
              href="/admin/courses/new"
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              + New Course
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Total Courses</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalCourses}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Published</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">{publishedCourses}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Drafts</h3>
            <p className="mt-2 text-3xl font-bold text-gray-600">{draftCourses}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              €{totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {coursesWithStats.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">No courses yet</h2>
            <p className="mt-2 text-gray-600">Create your first course to get started</p>
            <Link
              href="/admin/courses/new"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Create Course
            </Link>
          </div>
        ) : (
          <div className="rounded-lg bg-white shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Modules</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Enrollments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {coursesWithStats.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">
                          {course.language} • {course.level}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CourseStatusBadge isPublished={course.isPublished} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.moduleCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{course.enrollmentCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">€{Number(course.revenue).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}/preview`}
                          className="text-gray-600 hover:underline"
                        >
                          Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
