import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export default async function PreviewCoursePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin"]);
  const { id } = await params;

  const course = await prisma.videoCourse.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!course) redirect("/admin/courses");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 text-sm text-gray-500">Preview Mode</div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            </div>
            <a
              href={`/admin/courses/${course.id}/edit`}
              className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
            >
              Back to Edit
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-white p-8 shadow-sm">
          {course.description && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
              <p className="text-gray-700">{course.description}</p>
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <div className="text-sm text-gray-600">Language</div>
              <div className="font-medium text-gray-900">{course.language}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Level</div>
              <div className="font-medium text-gray-900">{course.level}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Price</div>
              <div className="font-medium text-gray-900">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: course.currency,
                }).format(Number(course.price))}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Modules</div>
              <div className="font-medium text-gray-900">{course.modules.length}</div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Course Content</h2>
            <div className="space-y-2">
              {course.modules.map((module, idx) => (
                <div key={module.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">{idx + 1}.</span>
                    <div>
                      <div className="font-medium text-gray-900">{module.title}</div>
                      {module.durationSec && (
                        <div className="text-sm text-gray-500">
                          {Math.floor(module.durationSec / 60)}:{(module.durationSec % 60).toString().padStart(2, "0")}
                        </div>
                      )}
                    </div>
                  </div>
                  {module.isPreview && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      Free Preview
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
