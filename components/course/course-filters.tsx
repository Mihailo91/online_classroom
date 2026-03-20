"use client";

import { useState } from "react";

interface CourseFiltersProps {
  onFilterChange: (filters: {
    language: string;
    level: string;
    search: string;
  }) => void;
}

export function CourseFilters({ onFilterChange }: CourseFiltersProps) {
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");

  const handleFilterChange = (
    newLanguage?: string,
    newLevel?: string,
    newSearch?: string
  ) => {
    const filters = {
      language: newLanguage !== undefined ? newLanguage : language,
      level: newLevel !== undefined ? newLevel : level,
      search: newSearch !== undefined ? newSearch : search,
    };

    setLanguage(filters.language);
    setLevel(filters.level);
    setSearch(filters.search);

    onFilterChange(filters);
  };

  const handleReset = () => {
    setLanguage("");
    setLevel("");
    setSearch("");
    onFilterChange({ language: "", level: "", search: "" });
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Filter Courses
      </h3>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => handleFilterChange(undefined, undefined, e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => handleFilterChange(e.target.value, undefined, undefined)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Languages</option>
            <option value="Spanish">Spanish</option>
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label
            htmlFor="level"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => handleFilterChange(undefined, e.target.value, undefined)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Reset Button */}
        {(language || level || search) && (
          <button
            onClick={handleReset}
            className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
