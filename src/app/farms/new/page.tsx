"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { farmsApi } from "@/lib/api";
import type { FarmCreate } from "@/lib/types";
import { Bird, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";

const today = new Date().toISOString().split("T")[0];

const DEFAULTS: FarmCreate = {
  farm_name: "",
  num_chicks: 1000,
  batch_start_date: today,
  expected_duration_days: 42,
  chick_price_per_unit: 80,
  feed_cost_per_kg: 100,
  expected_feed_per_bird_kg: 3.5,
  medicine_cost_total: 5000,
  labor_cost_per_day: 500,
  utilities_cost_total: 3000,
  expected_selling_price_per_kg: 280,
  expected_mortality_rate: 5,
  notes: "",
};

export default function NewFarmPage() {
  const router = useRouter();
  const [form, setForm] = useState<FarmCreate>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FarmCreate, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const farm = await farmsApi.create(form);
      router.push(`/farms/${farm.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create farm";
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/farms" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title flex items-center gap-2"><Bird size={22} className="text-primary-600" /> New Farm Batch</h1>
          <p className="text-gray-500 text-sm">Register a new broiler batch</p>
        </div>
      </div>

      {error && <div className="card p-3 bg-red-50 border-red-200 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Farm / Batch Name" required>
              <input className="input" required value={form.farm_name} onChange={(e) => set("farm_name", e.target.value)} placeholder="e.g. Batch 1 - Spring 2025" />
            </Field>
            <Field label="Number of Chicks" required>
              <input className="input" type="number" required min={1} value={form.num_chicks} onChange={(e) => set("num_chicks", +e.target.value)} />
            </Field>
            <Field label="Batch Start Date" required>
              <input className="input" type="date" required value={form.batch_start_date} onChange={(e) => set("batch_start_date", e.target.value)} />
            </Field>
            <Field label="Expected Duration (days)">
              <input className="input" type="number" min={30} max={70} value={form.expected_duration_days} onChange={(e) => set("expected_duration_days", +e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Costs */}
        <Section title="Cost Inputs (PKR)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Chick Price per Unit (PKR)" required>
              <input className="input" type="number" required min={1} step="0.01" value={form.chick_price_per_unit} onChange={(e) => set("chick_price_per_unit", +e.target.value)} />
            </Field>
            <Field label="Feed Cost per kg (PKR)" required>
              <input className="input" type="number" required min={1} step="0.01" value={form.feed_cost_per_kg} onChange={(e) => set("feed_cost_per_kg", +e.target.value)} />
            </Field>
            <Field label="Expected Feed per Bird (kg)">
              <input className="input" type="number" min={0.1} step="0.1" value={form.expected_feed_per_bird_kg} onChange={(e) => set("expected_feed_per_bird_kg", +e.target.value)} />
            </Field>
            <Field label="Medicine & Vaccine Cost Total (PKR)">
              <input className="input" type="number" min={0} step="0.01" value={form.medicine_cost_total} onChange={(e) => set("medicine_cost_total", +e.target.value)} />
            </Field>
            <Field label="Labor Cost per Day (PKR)">
              <input className="input" type="number" min={0} step="0.01" value={form.labor_cost_per_day} onChange={(e) => set("labor_cost_per_day", +e.target.value)} />
            </Field>
            <Field label="Utilities Cost Total (PKR)">
              <input className="input" type="number" min={0} step="0.01" value={form.utilities_cost_total} onChange={(e) => set("utilities_cost_total", +e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Revenue & Risk */}
        <Section title="Revenue & Risk Estimates">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Expected Selling Price per kg (PKR)" required>
              <input className="input" type="number" required min={1} step="0.01" value={form.expected_selling_price_per_kg} onChange={(e) => set("expected_selling_price_per_kg", +e.target.value)} />
            </Field>
            <Field label="Expected Mortality Rate (%)">
              <input className="input" type="number" min={0} max={50} step="0.1" value={form.expected_mortality_rate} onChange={(e) => set("expected_mortality_rate", +e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Notes */}
        <Section title="Notes (optional)">
          <textarea className="input h-24 resize-none" placeholder="Any additional notes for this batch..." value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </Section>

        <div className="flex justify-end gap-3">
          <Link href="/farms" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? "Saving..." : "Create Batch"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="section-title border-b border-gray-100 pb-2">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
