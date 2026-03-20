"use client";

import { useEffect, useState, useCallback } from "react";
import { CourseGrid } from "@/components/course/course-grid";
import { CourseFilters } from "@/components/course/course-filters";

interface Course {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  price: any;
  currency: string;
  moduleCount: number;
  totalDuration: number;
  enrollmentCount: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: "",
    level: "",
    search: "",
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.language) params.set("language", filters.language);
      if (filters.level) params.set("level", filters.level);
      if (filters.search) params.set("search", filters.search);

      const response = await fetch(`/api/courses?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (newFilters: {
    language: string;
    level: string;
    search: string;
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-4 py-16">
        <div className="container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Browse Our Courses
          </h1>
          <p className="text-lg text-blue-100">
            Choose from our collection of expert-led language courses
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <CourseFilters onFilterChange={handleFilterChange} />
          </aside>

          {/* Courses Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-gray-600">
                  {courses.length} course{courses.length !== 1 ? "s" : ""} found
                </div>
                <CourseGrid
                  courses={courses}
                  emptyMessage="No courses match your filters. Try adjusting your search."
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
