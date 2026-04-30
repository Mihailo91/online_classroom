interface CourseStatusBadgeProps {
  isPublished: boolean;
}

export function CourseStatusBadge({ isPublished }: CourseStatusBadgeProps) {
  return isPublished ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
      Draft
    </span>
  );
}
