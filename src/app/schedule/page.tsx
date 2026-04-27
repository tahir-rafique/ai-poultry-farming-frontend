"use client";

import { useEffect, useState } from "react";
import { schedulesApi } from "@/lib/api";
import type { FullSchedule } from "@/lib/types";
import { Syringe, Heart, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<FullSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedVaccines, setCheckedVaccines] = useState<Set<number>>(new Set());
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  useEffect(() => {
    schedulesApi.getFull().then((data) => {
      setSchedule(data);
      setLoading(false);
    });
  }, []);

  const toggleVaccine = (day: number) =>
    setCheckedVaccines((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });

  if (loading) return <Loader />;
  if (!schedule) return null;

  const completedCount = checkedVaccines.size;
  const totalCount = schedule.vaccination_schedule.length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Syringe size={24} className="text-primary-600" /> Vaccination & Care Schedule
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Standard 42-day broiler management protocol</p>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Vaccination Progress</p>
          <p className="text-sm font-bold text-primary-600">{completedCount} / {totalCount} done</p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vaccination Schedule */}
        <div className="space-y-3">
          <h2 className="section-title flex items-center gap-2">
            <Syringe size={18} className="text-primary-500" /> Vaccination Timeline
          </h2>
          {schedule.vaccination_schedule.map((v) => {
            const done = checkedVaccines.has(v.day);
            return (
              <div
                key={v.day}
                onClick={() => toggleVaccine(v.day)}
                className={`card p-4 cursor-pointer transition-all ${done ? "border-green-300 bg-green-50" : "hover:border-primary-300"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    done ? "bg-green-500 text-white" : "bg-primary-100 text-primary-700"
                  }`}>
                    {done ? <CheckCircle2 size={18} /> : `D${v.day}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${done ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {v.vaccine_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      🎯 {v.disease_target} · 💉 {v.method}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 italic">{v.notes}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Care Guidelines */}
        <div className="space-y-3">
          <h2 className="section-title flex items-center gap-2">
            <Heart size={18} className="text-red-500" /> Weekly Care Guidelines
          </h2>
          {schedule.care_guidelines.map((g) => {
            const open = expandedWeek === g.week;
            return (
              <div key={g.week} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedWeek(open ? null : g.week)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                      W{g.week}
                    </span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{g.title}</p>
                      <p className="text-xs text-gray-400">{g.temperature} · {g.feed_type}</p>
                    </div>
                  </div>
                  {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                    {[
                      ["🌡️ Temperature", g.temperature],
                      ["🌾 Feed", g.feed_type],
                      ["💧 Water", g.water],
                      ["💡 Lighting", g.lighting],
                      ["📝 Notes", g.notes],
                    ].map(([label, val]) => (
                      <div key={label} className="grid grid-cols-3 gap-2 text-sm">
                        <span className="text-gray-500 font-medium">{label}</span>
                        <span className="col-span-2 text-gray-700">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="card p-4 bg-blue-50 border-blue-200 text-sm text-blue-800">
        <strong>Tip:</strong> Click on a vaccination card to mark it as completed. The schedule follows standard Pakistan broiler farming practices. Consult a vet for region-specific adjustments.
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );
}
