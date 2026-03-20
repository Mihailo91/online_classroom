import { CourseCard } from "./course-card";

interface Course {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  level: "beginner" | "intermediate" | "advanced" | null;
  price: any; // Prisma Decimal
  currency: string;
  moduleCount: number;
  totalDuration: number;
  enrollmentCount: number;
}

interface CourseGridProps {
  courses: Course[];
  emptyMessage?: string;
}

export function CourseGrid({
  courses,
  emptyMessage = "No courses found.",
}: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <p className="mt-4 text-lg text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          description={course.description}
          language={course.language}
          level={course.level}
          price={Number(course.price)}
          currency={course.currency}
          moduleCount={course.moduleCount}
          totalDuration={course.totalDuration}
          enrollmentCount={course.enrollmentCount}
        />
      ))}
    </div>
  );
}
