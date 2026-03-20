"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type LessonSlot = {
  id: string;
  label: string;
  dayLabel: string;
  timeLabel: string;
  startsAt: string;
};

type LessonPackage = {
  id: string;
  name: string;
  lessonCount: number;
  validityDays: number | null;
  price: number;
  currency: string;
  pricingId: string;
};

type LessonProfessor = {
  id: string;
  name: string;
  avatarUrl: string | null;
  packages: LessonPackage[];
  slots: LessonSlot[];
};

interface PrivateLessonsPlannerProps {
  professors: LessonProfessor[];
  isLoggedIn: boolean;
  dashboardHref: string | null;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function PrivateLessonsPlanner({
  professors,
  isLoggedIn,
  dashboardHref,
}: PrivateLessonsPlannerProps) {
  const [selectedProfessorId, setSelectedProfessorId] = useState(
    professors[0]?.id ?? ""
  );
  const [selectedPackageId, setSelectedPackageId] = useState(
    professors[0]?.packages[0]?.id ?? ""
  );
  const [selectedSlotId, setSelectedSlotId] = useState(
    professors[0]?.slots[0]?.id ?? ""
  );

  const selectedProfessor = useMemo(
    () => professors.find((professor) => professor.id === selectedProfessorId),
    [professors, selectedProfessorId]
  );

  const selectedPackage = useMemo(
    () =>
      selectedProfessor?.packages.find((item) => item.id === selectedPackageId) ??
      selectedProfessor?.packages[0] ??
      null,
    [selectedProfessor, selectedPackageId]
  );

  const selectedSlot = useMemo(
    () =>
      selectedProfessor?.slots.find((slot) => slot.id === selectedSlotId) ??
      selectedProfessor?.slots[0] ??
      null,
    [selectedProfessor, selectedSlotId]
  );

  const handleProfessorChange = (professorId: string) => {
    const professor = professors.find((item) => item.id === professorId);
    setSelectedProfessorId(professorId);
    setSelectedPackageId(professor?.packages[0]?.id ?? "");
    setSelectedSlotId(professor?.slots[0]?.id ?? "");
  };

  if (professors.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Private lessons are coming soon
        </h2>
        <p className="mt-3 text-gray-600">
          We do not have teachers published yet. Please check back shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
      <div className="space-y-8">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">1. Choose a teacher</h2>
            <p className="mt-2 text-sm text-gray-600">
              Start by selecting the professor whose style and schedule fit you best.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {professors.map((professor) => {
              const isSelected = professor.id === selectedProfessorId;

              return (
                <button
                  key={professor.id}
                  type="button"
                  onClick={() => handleProfessorChange(professor.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                      {professor.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {professor.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {professor.packages.length} lesson plan
                        {professor.packages.length === 1 ? "" : "s"} ·{" "}
                        {professor.slots.length} upcoming slot
                        {professor.slots.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">2. Choose a plan</h2>
            <p className="mt-2 text-sm text-gray-600">
              Pricing is set per professor, so each teacher can offer different rates.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {selectedProfessor?.packages.map((item) => {
              const isSelected = item.id === selectedPackage?.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPackageId(item.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.lessonCount} lesson{item.lessonCount > 1 ? "s" : ""}
                        {item.validityDays
                          ? ` · Valid for ${item.validityDays} days`
                          : " · Book and attend one lesson"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(item.price, item.currency)}
                      </div>
                      {item.lessonCount > 1 && (
                        <div className="text-xs text-gray-500">
                          {formatCurrency(item.price / item.lessonCount, item.currency)} / lesson
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">3. Pick an available slot</h2>
            <p className="mt-2 text-sm text-gray-600">
              Upcoming one-hour lesson times are generated from the selected
              teacher&apos;s published availability and booked lessons are
              automatically excluded.
            </p>
          </div>

          {selectedProfessor?.slots.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {selectedProfessor.slots.map((slot) => {
                const isSelected = slot.id === selectedSlot?.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      {slot.dayLabel}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{slot.timeLabel}</div>
                    <div className="mt-2 text-xs uppercase tracking-wide text-blue-600">
                      Upcoming availability
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-sm text-gray-600">
              This teacher has no open lesson slots in the upcoming schedule.
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-gray-900 p-6 text-white shadow-sm lg:sticky lg:top-24">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            Booking summary
          </p>
          <h2 className="mt-3 text-2xl font-bold">Your private lesson setup</h2>
        </div>

        <dl className="space-y-5">
          <div>
            <dt className="text-sm text-gray-400">Teacher</dt>
            <dd className="mt-1 font-medium">
              {selectedProfessor?.name ?? "Choose a teacher"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Plan</dt>
            <dd className="mt-1 font-medium">
              {selectedPackage
                ? `${selectedPackage.name} · ${formatCurrency(
                    selectedPackage.price,
                    selectedPackage.currency
                  )}`
                : "Choose a plan"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-400">Preferred slot</dt>
            <dd className="mt-1 font-medium">
              {selectedSlot ? selectedSlot.label : "Choose a time slot"}
            </dd>
          </div>
        </dl>

        <div className="mt-8 space-y-3">
          {isLoggedIn ? (
            <Link
              href={dashboardHref ?? "/dashboard"}
              className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Continue from your dashboard
            </Link>
          ) : (
            <Link
              href="/login?callbackUrl=/lessons"
              className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in to continue
            </Link>
          )}

          <p className="text-sm text-gray-300">
            Next step: use your account area to complete payment and confirm
            the selected lesson time.
          </p>
        </div>
      </aside>
    </div>
  );
}
