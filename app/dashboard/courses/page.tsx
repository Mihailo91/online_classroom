"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  language: string | null;
  level: string | null;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  lastWatchedAt: Date | null;
}

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/dashboard/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data.map((item: any) => item.course));
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">Continue learning from where you left off</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {courses.length === 0 ? (
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
            <h2 className="mt-4 text-xl font-semibold text-gray-900">No courses yet</h2>
            <p className="mt-2 text-gray-600">Browse our course catalog and start learning today!</p>
            <Link
              href="/courses"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {course.thumbnailUrl && (
                  <div className="relative h-48 w-full">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    {course.language && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {course.language}
                      </span>
                    )}
                    {course.level && (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        {course.level}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-900">{course.title}</h3>

                  {course.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{course.description}</p>
                  )}

                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="text-gray-600">
                        {course.completedModules} / {course.totalModules} modules
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-xs text-gray-500">
                      {course.progressPercent}% complete
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white hover:bg-blue-700"
                  >
                    {course.completedModules === 0
                      ? "Start Learning"
                      : course.completedModules === course.totalModules
                      ? "Review Course"
                      : "Continue Learning"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
