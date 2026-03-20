"use client";

import { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

interface VimeoPlayerProps {
  vimeoVideoId: string;
  courseId: string;
  moduleId: string;
  initialProgress?: number; // seconds
  onProgressUpdate?: (seconds: number) => void;
  onComplete?: () => void;
}

export function VimeoPlayer({
  vimeoVideoId,
  courseId,
  moduleId,
  initialProgress = 0,
  onProgressUpdate,
  onComplete,
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSavedTime = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Vimeo player
    const player = new Player(containerRef.current, {
      id: parseInt(vimeoVideoId),
      width: 640,
      responsive: true,
      autoplay: false,
      dnt: true, // Do not track
    });

    playerRef.current = player;

    // Player ready
    player.ready().then(() => {
      setIsReady(true);

      // Restore previous position
      if (initialProgress > 0) {
        player.setCurrentTime(initialProgress).catch((err) => {
          console.error("Failed to restore position:", err);
        });
      }
    }).catch((err) => {
      console.error("Vimeo player error:", err);
      setError("Failed to load video player");
    });

    // Track progress (debounced - save every 10 seconds)
    player.on("timeupdate", (data) => {
      const currentTime = Math.floor(data.seconds);

      // Save progress every 10 seconds
      if (currentTime - lastSavedTime.current >= 10) {
        lastSavedTime.current = currentTime;
        saveProgress(currentTime, false);
        onProgressUpdate?.(currentTime);
      }
    });

    // Mark as complete when video ends
    player.on("ended", () => {
      player.getCurrentTime().then((time) => {
        saveProgress(Math.floor(time), true);
        onComplete?.();
      });
    });

    // Save progress on pause
    player.on("pause", () => {
      player.getCurrentTime().then((time) => {
        saveProgress(Math.floor(time), false);
      });
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [vimeoVideoId, courseId, moduleId]);

  const saveProgress = async (seconds: number, completed: boolean) => {
    try {
      await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            watchedSeconds: seconds,
            completed,
          }),
        }
      );
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };

  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-900 text-white">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="rounded-lg overflow-hidden" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
