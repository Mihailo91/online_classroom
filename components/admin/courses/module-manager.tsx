"use client";

import { useState } from "react";

interface Module {
  id?: string;
  title: string;
  vimeoUrl: string;
  durationSec?: number;
  isPreview: boolean;
  orderIndex: number;
}

interface ModuleManagerProps {
  modules: Module[];
  courseId?: string;
  onChange: (modules: Module[]) => void;
}

export function ModuleManager({ modules: initialModules, courseId, onChange }: ModuleManagerProps) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [editing, setEditing] = useState<number | null>(null);

  const addModule = () => {
    const newModules = [
      ...modules,
      {
        title: "",
        vimeoUrl: "",
        durationSec: 0,
        isPreview: false,
        orderIndex: modules.length + 1,
      },
    ];
    setModules(newModules);
    onChange(newModules);
    setEditing(newModules.length - 1);
  };

  const updateModule = (index: number, updates: Partial<Module>) => {
    const newModules = modules.map((m, i) => (i === index ? { ...m, ...updates } : m));
    setModules(newModules);
    onChange(newModules);
  };

  const deleteModule = async (index: number) => {
    const mod = modules[index];
    if (courseId && mod.id) {
      try {
        await fetch(`/api/admin/courses/${courseId}/modules/${mod.id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Failed to delete module:", err);
      }
    }
    const newModules = modules.filter((_, i) => i !== index).map((m, i) => ({ ...m, orderIndex: i + 1 }));
    setModules(newModules);
    onChange(newModules);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newModules = [...modules];
    [newModules[index - 1], newModules[index]] = [newModules[index], newModules[index - 1]];
    newModules.forEach((m, i) => (m.orderIndex = i + 1));
    setModules(newModules);
    onChange(newModules);
  };

  const moveDown = (index: number) => {
    if (index === modules.length - 1) return;
    const newModules = [...modules];
    [newModules[index], newModules[index + 1]] = [newModules[index + 1], newModules[index]];
    newModules.forEach((m, i) => (m.orderIndex = i + 1));
    setModules(newModules);
    onChange(newModules);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
        <button
          type="button"
          onClick={addModule}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <p className="text-sm text-gray-500">No modules yet. Click &quot;Add Module&quot; to get started.</p>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, index) => (
            <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
              {editing === index ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Module title"
                    value={mod.title}
                    onChange={(e) => updateModule(index, { title: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Vimeo URL (e.g., https://vimeo.com/123456)"
                    value={mod.vimeoUrl}
                    onChange={(e) => updateModule(index, { vimeoUrl: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Duration (seconds)"
                      value={mod.durationSec || ""}
                      onChange={(e) => updateModule(index, { durationSec: parseInt(e.target.value) || 0 })}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={mod.isPreview}
                        onChange={(e) => updateModule(index, { isPreview: e.target.checked })}
                        className="rounded"
                      />
                      Free Preview
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {index + 1}. {mod.title || "(Untitled)"}
                      </span>
                      {mod.isPreview && (
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">Preview</span>
                      )}
                    </div>
                    {mod.vimeoUrl && <p className="text-xs text-gray-500">{mod.vimeoUrl}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === modules.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(index)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteModule(index)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
