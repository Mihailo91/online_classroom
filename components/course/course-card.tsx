import Link from "next/link";
import { CourseLevel } from "@prisma/client";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  language: string | null;
  level: CourseLevel | null;
  price: number;
  currency: string;
  moduleCount: number;
  totalDuration: number;
  enrollmentCount: number;
}

export function CourseCard({
  id,
  title,
  description,
  language,
  level,
  price,
  currency,
  moduleCount,
  totalDuration,
  enrollmentCount,
}: CourseCardProps) {
  // Format duration from seconds to hours:minutes
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Format price
  const priceText = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "EUR",
  }).format(price);

  // Level badge color
  const levelColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <Link href={`/courses/${id}`}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-500">
        {/* Language & Level Badges */}
        <div className="mb-3 flex items-center gap-2">
          {language && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              {language}
            </span>
          )}
          {level && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                levelColors[level]
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {description}
          </p>
        )}

        {/* Stats */}
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
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
            <span>{moduleCount} modules</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{durationText}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>{enrollmentCount} enrolled</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">{priceText}</span>
          <span className="text-sm text-blue-600 group-hover:underline">
            Learn more →
          </span>
        </div>
      </div>
    </Link>
  );
}
