"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CourseForm } from "@/components/admin/courses/course-form";
import { ModuleManager } from "@/components/admin/courses/module-manager";
import { CourseStatusBadge } from "@/components/admin/courses/course-status-badge";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCourse = async () => {
    const response = await fetch(`/api/admin/courses/${id}`);
    if (response.ok) {
      const data = await response.json();
      setCourse(data);
      setModules(data.modules || []);
    }
    setLoading(false);
  };

  const handleCourseUpdate = async (formData: any) => {
    const response = await fetch(`/api/admin/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error("Failed to update course");
    await loadCourse();
  };

  const togglePublish = async () => {
    const response = await fetch(`/api/admin/courses/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    if (response.ok) await loadCourse();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const response = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/admin/courses");
  };

  const handleModuleChange = async (updatedModules: any[]) => {
    setModules(updatedModules);
    for (const mod of updatedModules) {
      if (mod.id) {
        await fetch(`/api/admin/courses/${id}/modules/${mod.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mod),
        });
      } else if (mod.title && mod.vimeoUrl) {
        await fetch(`/api/admin/courses/${id}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mod),
        });
      }
    }
    await loadCourse();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!course) return <div className="flex min-h-screen items-center justify-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <CourseStatusBadge isPublished={course.isPublished} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={togglePublish}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                {course.isPublished ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Enrollments</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{course.enrollmentCount}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">€{Number(course.revenue).toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Modules</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{modules.length}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Course Information</h2>
            <CourseForm initialData={course} onSubmit={handleCourseUpdate} submitLabel="Update Course" />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <ModuleManager modules={modules} courseId={id} onChange={handleModuleChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
