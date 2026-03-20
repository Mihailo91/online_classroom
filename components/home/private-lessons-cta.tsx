import Link from "next/link";

export function PrivateLessonsCTA() {
  return (
    <section className="bg-blue-600 py-16">
      <div className="container mx-auto px-4 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-white p-4">
            <svg
              className="h-12 w-12 text-blue-600"
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
          </div>
        </div>

        {/* Content */}
        <h2 className="mb-4 text-3xl font-bold text-white">
          Need Personalized Attention?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
          Book 1-on-1 private lessons with our experienced language professors.
          Get personalized feedback, practice conversation skills, and learn at
          your own pace.
        </p>

        {/* Features */}
        <div className="mb-8 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Flexible Scheduling</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Customized Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Native Speakers</span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/lessons"
          className="inline-block rounded-lg bg-white px-8 py-3 text-lg font-semibold text-blue-600 hover:bg-gray-100"
        >
          Book Private Lessons
        </Link>
      </div>
    </section>
  );
}
