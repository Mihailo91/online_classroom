"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VimeoPlayer } from "@/components/video/vimeo-player";

interface Module {
  id: string;
  title: string;
  orderIndex: number;
  vimeoVideoId: string;
  durationSec: number;
  progress: {
    watchedSeconds: number;
    completed: boolean;
  };
}

export default function WatchCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: courseId } = use(params);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`);

      if (!response.ok) {
        if (response.status === 403) {
          router.push(`/courses/${courseId}?error=purchase_required`);
          return;
        }
        throw new Error("Failed to load modules");
      }

      const data = await response.json();
      setModules(data);

      const firstIncomplete = data.findIndex((m: Module) => !m.progress.completed);
      setCurrentModuleIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      setLoading(false);
    } catch (err) {
      console.error("Error loading modules:", err);
      setError("Failed to load course content");
      setLoading(false);
    }
  };

  const handleProgressUpdate = (seconds: number) => {
    setModules((prev) =>
      prev.map((m, idx) =>
        idx === currentModuleIndex
          ? {
              ...m,
              progress: { ...m.progress, watchedSeconds: seconds },
            }
          : m
      )
    );
  };

  const handleModuleComplete = () => {
    setModules((prev) =>
      prev.map((m, idx) =>
        idx === currentModuleIndex
          ? {
              ...m,
              progress: { ...m.progress, completed: true },
            }
          : m
      )
    );

    if (currentModuleIndex < modules.length - 1) {
      setTimeout(() => {
        setCurrentModuleIndex(currentModuleIndex + 1);
      }, 2000);
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{error}</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentModule = modules[currentModuleIndex];
  const completedCount = modules.filter((m) => m.progress.completed).length;
  const progressPercent = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {currentModule.title}
              </h2>

              <VimeoPlayer
                vimeoVideoId={currentModule.vimeoVideoId}
                courseId={courseId}
                moduleId={currentModule.id}
                initialProgress={currentModule.progress.watchedSeconds}
                onProgressUpdate={handleProgressUpdate}
                onComplete={handleModuleComplete}
              />

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={handlePreviousModule}
                  disabled={currentModuleIndex === 0}
                  className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ← Previous
                </button>

                <span className="text-sm text-gray-600">
                  Module {currentModuleIndex + 1} of {modules.length}
                </span>

                <button
                  onClick={handleNextModule}
                  disabled={currentModuleIndex === modules.length - 1}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Course Content
              </h3>

              <div className="mb-4">
                <div className="mb-2 text-sm text-gray-600">
                  {completedCount} / {modules.length} completed
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-600 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {modules.map((module, idx) => {
                  const isCurrent = idx === currentModuleIndex;
                  const isCompleted = module.progress.completed;

                  return (
                    <button
                      key={module.id}
                      onClick={() => setCurrentModuleIndex(idx)}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        isCurrent
                          ? "border-2 border-blue-600 bg-blue-100"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <svg
                              className="h-5 w-5 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : isCurrent ? (
                            <svg
                              className="h-5 w-5 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-400"></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div
                            className={`text-sm font-medium ${
                              isCurrent ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {module.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.floor(module.durationSec / 60)}:
                            {(module.durationSec % 60)
                              .toString()
                              .padStart(2, "0")}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
