"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { predictionsApi } from "@/lib/api";
import type { PredictionInput, PredictionResult } from "@/lib/types";
import { formatPKR, formatNumber, verdictBg } from "@/lib/utils";
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart2,
  DollarSign,
  Percent,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DEFAULTS: PredictionInput = {
  num_chicks: 2000,
  chick_price_per_unit: 80,
  feed_cost_per_kg: 100,
  expected_feed_per_bird_kg: 3.5,
  medicine_cost_total: 8000,
  labor_cost_per_day: 600,
  utilities_cost_total: 5000,
  expected_duration_days: 42,
  expected_selling_price_per_kg: 280,
  expected_mortality_rate: 5,
  expected_avg_weight_kg: 2.2,
};

const PIE_COLORS = ["#4ade80", "#fbbf24", "#f87171", "#a78bfa", "#60a5fa"];

function PredictContent() {
  const searchParams = useSearchParams();
  const farmId = searchParams.get("farm_id") ?? undefined;

  const [form, setForm] = useState<PredictionInput>({
    ...DEFAULTS,
    farm_id: farmId,
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof PredictionInput, value: string | number) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictionsApi.predict(form);
      setResult(res);
    } catch {
      setError("Prediction failed. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const pieData = result
    ? [
        { name: "Chick Cost", value: result.cost_breakdown.chick_cost },
        { name: "Feed Cost", value: result.cost_breakdown.feed_cost },
        { name: "Medicine", value: result.cost_breakdown.medicine_cost },
        { name: "Labor", value: result.cost_breakdown.labor_cost },
        { name: "Utilities", value: result.cost_breakdown.utilities_cost },
      ]
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <BrainCircuit size={24} className="text-primary-600" /> AI Profit
          Prediction
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Enter your batch details to get an ML-powered profit/loss forecast
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="section-title">Batch Parameters</h2>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="No. of Chicks">
              <input
                className="input"
                type="number"
                min={1}
                value={form.num_chicks}
                onChange={(e) => set("num_chicks", +e.target.value)}
              />
            </FormField>
            <FormField label="Chick Price (PKR/unit)">
              <input
                className="input"
                type="number"
                min={1}
                step="0.01"
                value={form.chick_price_per_unit}
                onChange={(e) => set("chick_price_per_unit", +e.target.value)}
              />
            </FormField>
            <FormField label="Feed Cost (PKR/kg)">
              <input
                className="input"
                type="number"
                min={1}
                step="0.01"
                value={form.feed_cost_per_kg}
                onChange={(e) => set("feed_cost_per_kg", +e.target.value)}
              />
            </FormField>
            <FormField label="Feed per Bird (kg)">
              <input
                className="input"
                type="number"
                min={0.1}
                step="0.1"
                value={form.expected_feed_per_bird_kg}
                onChange={(e) =>
                  set("expected_feed_per_bird_kg", +e.target.value)
                }
              />
            </FormField>
            <FormField label="Medicine Cost (PKR total)">
              <input
                className="input"
                type="number"
                min={0}
                step="1"
                value={form.medicine_cost_total}
                onChange={(e) => set("medicine_cost_total", +e.target.value)}
              />
            </FormField>
            <FormField label="Labor/Day (PKR)">
              <input
                className="input"
                type="number"
                min={0}
                step="1"
                value={form.labor_cost_per_day}
                onChange={(e) => set("labor_cost_per_day", +e.target.value)}
              />
            </FormField>
            <FormField label="Utilities Total (PKR)">
              <input
                className="input"
                type="number"
                min={0}
                step="1"
                value={form.utilities_cost_total}
                onChange={(e) => set("utilities_cost_total", +e.target.value)}
              />
            </FormField>
            <FormField label="Duration (days)">
              <input
                className="input"
                type="number"
                min={30}
                max={70}
                value={form.expected_duration_days}
                onChange={(e) => set("expected_duration_days", +e.target.value)}
              />
            </FormField>
            <FormField label="Sell Price (PKR/kg)">
              <input
                className="input"
                type="number"
                min={1}
                step="0.01"
                value={form.expected_selling_price_per_kg}
                onChange={(e) =>
                  set("expected_selling_price_per_kg", +e.target.value)
                }
              />
            </FormField>
            <FormField label="Mortality Rate (%)">
              <input
                className="input"
                type="number"
                min={0}
                max={50}
                step="0.1"
                value={form.expected_mortality_rate}
                onChange={(e) =>
                  set("expected_mortality_rate", +e.target.value)
                }
              />
            </FormField>
            <FormField label="Avg Live Weight (kg)">
              <input
                className="input"
                type="number"
                min={0.5}
                max={5}
                step="0.1"
                value={form.expected_avg_weight_kg}
                onChange={(e) => set("expected_avg_weight_kg", +e.target.value)}
              />
            </FormField>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            <BrainCircuit size={18} />
            {loading ? "Running AI Model..." : "Predict Profit / Loss"}
          </button>
        </form>

        {/* Results Panel */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-10 flex flex-col items-center justify-center text-center text-gray-400 h-full min-h-[300px]">
              <BrainCircuit size={48} className="mb-3 opacity-20" />
              <p className="font-medium">Fill in the form and run prediction</p>
              <p className="text-sm mt-1">AI analysis will appear here</p>
            </div>
          )}

          {loading && (
            <div className="card p-10 flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="animate-spin h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full mb-3" />
              <p className="text-gray-500 text-sm">Running ML model...</p>
            </div>
          )}

          {result && (
            <>
              {/* Verdict Banner */}
              <div
                className={`card p-5 border-2 ${
                  result.verdict === "Profitable"
                    ? "border-green-400 bg-green-50"
                    : result.verdict === "Loss"
                      ? "border-red-400 bg-red-50"
                      : "border-yellow-400 bg-yellow-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {result.verdict === "Profitable" ? (
                    <TrendingUp size={32} className="text-green-600" />
                  ) : result.verdict === "Loss" ? (
                    <TrendingDown size={32} className="text-red-600" />
                  ) : (
                    <AlertTriangle size={32} className="text-yellow-600" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Prediction Verdict</p>
                    <p
                      className={`text-2xl font-bold ${
                        result.verdict === "Profitable"
                          ? "text-green-700"
                          : result.verdict === "Loss"
                            ? "text-red-700"
                            : "text-yellow-700"
                      }`}
                    >
                      {result.verdict}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-400">Rule-based Profit</p>
                    <p
                      className={`text-xl font-bold ${result.predicted_profit >= 0 ? "text-green-700" : "text-red-700"}`}
                    >
                      {formatPKR(result.predicted_profit)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ML Model: {formatPKR(result.ml_predicted_profit)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <MetricCard
                  icon={<DollarSign size={16} className="text-blue-600" />}
                  label="Total Cost"
                  value={formatPKR(result.cost_breakdown.total_cost)}
                  bg="bg-blue-50"
                />
                <MetricCard
                  icon={<BarChart2 size={16} className="text-green-600" />}
                  label="Revenue"
                  value={formatPKR(result.total_revenue)}
                  bg="bg-green-50"
                />
                <MetricCard
                  icon={<Percent size={16} className="text-purple-600" />}
                  label="ROI"
                  value={`${result.roi_percent}%`}
                  bg="bg-purple-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  icon={<BarChart2 size={16} className="text-orange-600" />}
                  label="Profit Margin"
                  value={`${result.profit_margin_percent}%`}
                  bg="bg-orange-50"
                />
                <MetricCard
                  icon={<BrainCircuit size={16} className="text-primary-600" />}
                  label="Birds Sold"
                  value={formatNumber(result.birds_sold)}
                  bg="bg-primary-50"
                />
              </div>

              {/* Cost Breakdown Pie */}
              <div className="card p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Cost Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatPKR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PredictPage() {
  return (
    <Suspense>
      <PredictContent />
    </Suspense>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label text-xs">{label}</label>
      {children}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`card p-3 ${bg}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );
}
