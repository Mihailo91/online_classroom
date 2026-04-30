"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseForm } from "@/components/admin/courses/course-form";
import { ModuleManager } from "@/components/admin/courses/module-manager";

export default function NewCoursePage() {
  const router = useRouter();
  const [courseData, setCourseData] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);

  const handleCourseSubmit = async (formData: any) => {
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        modules,
      }),
    });

    if (!response.ok) throw new Error("Failed to create course");

    const course = await response.json();
    router.push(`/admin/courses/${course.id}/edit`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-gray-600">Add course details and modules</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Course Information</h2>
            <CourseForm onSubmit={handleCourseSubmit} submitLabel="Create Course" />
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <ModuleManager modules={modules} onChange={setModules} />
          </div>
        </div>
      </div>
    </div>
  );
}
