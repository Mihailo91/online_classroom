import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  await requireRole(["admin"]);

  const [totalCourses, publishedCourses, totalStudents, totalProfessors, recentCourses] =
    await Promise.all([
      prisma.videoCourse.count(),
      prisma.videoCourse.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "professor" } }),
      prisma.videoCourse.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { studentCourses: true, modules: true } },
        },
      }),
    ]);

  const draftCourses = totalCourses - publishedCourses;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your language school</p>
      </div>

      {/* Action cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/courses"
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
        >
          <div className="rounded-lg bg-blue-100 p-3 transition-colors group-hover:bg-blue-600">
            <svg className="h-6 w-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Video Courses</h3>
            <p className="text-sm text-gray-500">Manage all courses</p>
          </div>
          <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/admin/courses/new"
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-green-500 hover:shadow-md"
        >
          <div className="rounded-lg bg-green-100 p-3 transition-colors group-hover:bg-green-600">
            <svg className="h-6 w-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600">New Course</h3>
            <p className="text-sm text-gray-500">Create a video course</p>
          </div>
          <svg className="h-5 w-5 text-gray-400 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm opacity-50">
          <div className="rounded-lg bg-gray-100 p-3">
            <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">User Management</h3>
            <p className="text-sm text-gray-500">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Courses</p>
          <p className="mt-2 text-4xl font-bold text-gray-900">{totalCourses}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Published</p>
          <p className="mt-2 text-4xl font-bold text-green-600">{publishedCourses}</p>
          <p className="mt-1 text-xs text-gray-400">{draftCourses} draft{draftCourses !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Students</p>
          <p className="mt-2 text-4xl font-bold text-blue-600">{totalStudents}</p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Professors</p>
          <p className="mt-2 text-4xl font-bold text-purple-600">{totalProfessors}</p>
        </div>
      </div>

      {/* Recent courses */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Courses</h2>
          <Link href="/admin/courses" className="text-sm font-medium text-blue-600 hover:underline">
            View all →
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">No courses yet.</p>
            <Link
              href="/admin/courses/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create your first course
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Modules</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Students</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recentCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-xs text-gray-400">
                      {course.language} · {course.level}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {course.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{course._count.modules}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{course._count.studentCourses}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}/preview`}
                        className="text-sm font-medium text-gray-500 hover:underline"
                      >
                        Preview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

