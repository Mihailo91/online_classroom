import { auth } from "@/auth";
import { PrivateLessonsPlanner } from "@/components/lessons/private-lessons-planner";
import { prisma } from "@/lib/prisma";
import { getRoleBasedRedirect } from "@/lib/auth-helpers";

const SLOT_DURATION_MINUTES = 60;
const SLOT_LOOKAHEAD_DAYS = 21;
const MAX_SLOTS_PER_PROFESSOR = 8;

type AvailabilityRecord = {
  id: string;
  dayOfWeek: number | null;
  startTime: Date;
  endTime: Date;
  isRecurring: boolean;
  specificDate: Date | null;
};

type BookedLessonRecord = {
  scheduledAt: Date;
  durationMin: number;
};

function addMinutes(value: Date, minutes: number) {
  return new Date(value.getTime() + minutes * 60 * 1000);
}

function addDays(value: Date, days: number) {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function startOfUtcDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
}

function combineUtcDateAndTime(date: Date, time: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      time.getUTCHours(),
      time.getUTCMinutes(),
      time.getUTCSeconds(),
      time.getUTCMilliseconds()
    )
  );
}

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(value);
}

function formatDateTime(value: Date) {
  return `${formatDate(value)} · ${formatTime(value)}`;
}

function overlaps(
  slotStart: Date,
  slotEnd: Date,
  lessonStart: Date,
  lessonEnd: Date
) {
  return slotStart < lessonEnd && lessonStart < slotEnd;
}

function buildUpcomingSlots(
  availability: AvailabilityRecord[],
  bookedLessons: BookedLessonRecord[]
) {
  const now = new Date();
  const today = startOfUtcDay(now);
  const windowEnd = addDays(today, SLOT_LOOKAHEAD_DAYS);
  const slots: Array<{
    id: string;
    label: string;
    dayLabel: string;
    timeLabel: string;
    startsAt: string;
  }> = [];

  const bookedWindows = bookedLessons.map((lesson) => ({
    start: lesson.scheduledAt,
    end: addMinutes(lesson.scheduledAt, lesson.durationMin),
  }));

  const maybeAddSlotsForDate = (availabilitySlot: AvailabilityRecord, baseDate: Date) => {
    const slotStart = combineUtcDateAndTime(baseDate, availabilitySlot.startTime);
    const slotEnd = combineUtcDateAndTime(baseDate, availabilitySlot.endTime);

    for (
      let current = slotStart;
      addMinutes(current, SLOT_DURATION_MINUTES) <= slotEnd;
      current = addMinutes(current, SLOT_DURATION_MINUTES)
    ) {
      if (current <= now) {
        continue;
      }

      const currentEnd = addMinutes(current, SLOT_DURATION_MINUTES);
      const isBooked = bookedWindows.some((lesson) =>
        overlaps(current, currentEnd, lesson.start, lesson.end)
      );

      if (isBooked) {
        continue;
      }

      slots.push({
        id: `${availabilitySlot.id}:${current.toISOString()}`,
        label: formatDateTime(current),
        dayLabel: formatDate(current),
        timeLabel: `${formatTime(current)} - ${formatTime(currentEnd)}`,
        startsAt: current.toISOString(),
      });
    }
  };

  for (const availabilitySlot of availability) {
    if (availabilitySlot.isRecurring && availabilitySlot.dayOfWeek !== null) {
      for (let offset = 0; offset <= SLOT_LOOKAHEAD_DAYS; offset += 1) {
        const baseDate = addDays(today, offset);
        if (baseDate > windowEnd || baseDate.getUTCDay() !== availabilitySlot.dayOfWeek) {
          continue;
        }

        maybeAddSlotsForDate(availabilitySlot, baseDate);
      }

      continue;
    }

    if (!availabilitySlot.specificDate) {
      continue;
    }

    const baseDate = startOfUtcDay(availabilitySlot.specificDate);
    if (baseDate < today || baseDate > windowEnd) {
      continue;
    }

    maybeAddSlotsForDate(availabilitySlot, baseDate);
  }

  return slots
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
    .slice(0, MAX_SLOTS_PER_PROFESSOR);
}

export default async function LessonsPage() {
  const session = await auth();
  const now = new Date();

  const professors = await prisma.user.findMany({
    where: {
      role: "professor",
      professorPricing: {
        some: {
          isActive: true,
          package: {
            isActive: true,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      professorPricing: {
        where: {
          isActive: true,
          package: {
            isActive: true,
          },
        },
        orderBy: {
          package: {
            lessonCount: "asc",
          },
        },
        select: {
          id: true,
          price: true,
          currency: true,
          package: {
            select: {
              id: true,
              name: true,
              lessonCount: true,
              validityDays: true,
            },
          },
        },
      },
      professorAvailability: {
        where: {
          isAvailable: true,
        },
        orderBy: [{ specificDate: "asc" }, { dayOfWeek: "asc" }, { startTime: "asc" }],
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          isRecurring: true,
          specificDate: true,
        },
      },
      professorLessons: {
        where: {
          status: "scheduled",
          scheduledAt: {
            gte: now,
          },
        },
        orderBy: {
          scheduledAt: "asc",
        },
        select: {
          scheduledAt: true,
          durationMin: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const normalizedProfessors = professors.map((professor) => ({
    id: professor.id,
    name: professor.name,
    avatarUrl: professor.avatarUrl,
    packages: professor.professorPricing.map((pricing) => ({
      id: pricing.package.id,
      pricingId: pricing.id,
      name: pricing.package.name,
      lessonCount: pricing.package.lessonCount,
      validityDays: pricing.package.validityDays,
      price: Number(pricing.price),
      currency: pricing.currency,
    })),
    slots: buildUpcomingSlots(
      professor.professorAvailability,
      professor.professorLessons
    ),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Private lessons
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Build your one-on-one learning plan
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Compare teacher packages, choose the instructor that matches your
            goals, and review upcoming lesson times pulled directly from live
            availability.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <PrivateLessonsPlanner
          professors={normalizedProfessors}
          isLoggedIn={Boolean(session?.user)}
          dashboardHref={session?.user ? getRoleBasedRedirect(session.user.role) : null}
        />
      </section>
    </div>
  );
}
