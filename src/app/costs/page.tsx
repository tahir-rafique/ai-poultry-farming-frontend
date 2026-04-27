"use client";

import { useState } from "react";
import { costsApi } from "@/lib/api";
import type { PredictionInput, CostCalculation } from "@/lib/types";
import { formatPKR, formatNumber } from "@/lib/utils";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DEFAULTS: PredictionInput = {
  num_chicks: 1000,
  chick_price_per_unit: 80,
  feed_cost_per_kg: 100,
  expected_feed_per_bird_kg: 3.5,
  medicine_cost_total: 5000,
  labor_cost_per_day: 500,
  utilities_cost_total: 3000,
  expected_duration_days: 42,
  expected_selling_price_per_kg: 280,
  expected_mortality_rate: 5,
  expected_avg_weight_kg: 2.2,
};

export default function CostsPage() {
  const [form, setForm] = useState<PredictionInput>(DEFAULTS);
  const [result, setResult] = useState<CostCalculation | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof PredictionInput, value: number) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await costsApi.calculate(form);
    setResult(data);
    setLoading(false);
  };

  const radialData = result
    ? [
        {
          name: "Feed",
          value: result.breakdown_percentages.feed_cost_pct,
          fill: "#4ade80",
        },
        {
          name: "Chick",
          value: result.breakdown_percentages.chick_cost_pct,
          fill: "#60a5fa",
        },
        {
          name: "Labor",
          value: result.breakdown_percentages.labor_cost_pct,
          fill: "#fbbf24",
        },
        {
          name: "Medicine",
          value: result.breakdown_percentages.medicine_cost_pct,
          fill: "#f87171",
        },
        {
          name: "Utilities",
          value: result.breakdown_percentages.utilities_cost_pct,
          fill: "#a78bfa",
        },
      ]
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Calculator size={24} className="text-primary-600" /> Cost Calculator
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Calculate exact costs and revenue breakdown for any batch scenario
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h2 className="section-title">Input Parameters</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Number of Chicks", "num_chicks", 1, 100000, 1],
              ["Chick Price (PKR/unit)", "chick_price_per_unit", 1, 500, 0.01],
              ["Feed Price (PKR/kg)", "feed_cost_per_kg", 1, 500, 0.01],
              ["Feed/Bird (kg)", "expected_feed_per_bird_kg", 0.1, 10, 0.1],
              ["Medicine Total (PKR)", "medicine_cost_total", 0, 200000, 1],
              ["Labor/Day (PKR)", "labor_cost_per_day", 0, 10000, 1],
              ["Utilities Total (PKR)", "utilities_cost_total", 0, 200000, 1],
              ["Duration (days)", "expected_duration_days", 30, 70, 1],
              [
                "Sell Price (PKR/kg)",
                "expected_selling_price_per_kg",
                1,
                1000,
                0.01,
              ],
              ["Mortality Rate (%)", "expected_mortality_rate", 0, 50, 0.1],
              ["Avg Weight (kg)", "expected_avg_weight_kg", 0.5, 5, 0.1],
            ].map(([label, field, min, max, step]) => (
              <div key={field as string}>
                <label className="label text-xs">{label as string}</label>
                <input
                  className="input text-sm"
                  type="number"
                  min={min as number}
                  max={max as number}
                  step={step as number}
                  value={form[field as keyof PredictionInput] as number}
                  onChange={(e) =>
                    set(field as keyof PredictionInput, +e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            <Calculator size={18} />
            {loading ? "Calculating..." : "Calculate Costs"}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-4">
          {!result ? (
            <div className="card p-10 flex flex-col items-center justify-center text-center text-gray-400 min-h-[300px]">
              <Calculator size={48} className="mb-3 opacity-20" />
              <p>Results will appear here after calculation</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard
                  label="Total Cost"
                  value={formatPKR(result.cost_breakdown.total_cost)}
                  color="text-red-600"
                  icon={<DollarSign size={16} />}
                />
                <SummaryCard
                  label="Total Revenue"
                  value={formatPKR(result.total_revenue)}
                  color="text-blue-600"
                  icon={<TrendingUp size={16} />}
                />
                <SummaryCard
                  label="Gross Profit"
                  value={formatPKR(result.gross_profit)}
                  color={
                    result.gross_profit >= 0 ? "text-green-600" : "text-red-600"
                  }
                  icon={<TrendingUp size={16} />}
                />
                <SummaryCard
                  label="ROI"
                  value={`${result.roi_percent}%`}
                  color="text-purple-600"
                  icon={<Calculator size={16} />}
                />
                <SummaryCard
                  label="Cost per Bird"
                  value={formatPKR(result.cost_per_bird)}
                  color="text-gray-700"
                  icon={<DollarSign size={16} />}
                />
                <SummaryCard
                  label="Birds Sold"
                  value={formatNumber(result.birds_sold)}
                  color="text-primary-600"
                  icon={<Calculator size={16} />}
                />
              </div>

              {/* Detailed breakdown */}
              <div className="card p-5">
                <h3 className="section-title mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                  {[
                    [
                      "🐣 Chick Cost",
                      result.cost_breakdown.chick_cost,
                      result.breakdown_percentages.chick_cost_pct,
                      "bg-blue-400",
                    ],
                    [
                      "🌾 Feed Cost",
                      result.cost_breakdown.feed_cost,
                      result.breakdown_percentages.feed_cost_pct,
                      "bg-green-400",
                    ],
                    [
                      "💊 Medicine",
                      result.cost_breakdown.medicine_cost,
                      result.breakdown_percentages.medicine_cost_pct,
                      "bg-red-400",
                    ],
                    [
                      "👷 Labor",
                      result.cost_breakdown.labor_cost,
                      result.breakdown_percentages.labor_cost_pct,
                      "bg-yellow-400",
                    ],
                    [
                      "⚡ Utilities",
                      result.cost_breakdown.utilities_cost,
                      result.breakdown_percentages.utilities_cost_pct,
                      "bg-purple-400",
                    ],
                  ].map(([label, amount, pct, barColor]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="text-gray-600">{label as string}</span>
                        <span className="font-medium">
                          {formatPKR(amount as number)}{" "}
                          <span className="text-gray-400">
                            ({pct as number}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`${barColor as string} h-1.5 rounded-full`}
                          style={{ width: `${pct as number}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={`card p-4 text-center font-semibold ${
                  result.verdict === "Profitable"
                    ? "bg-green-50 text-green-700"
                    : result.verdict === "Loss"
                      ? "bg-red-50 text-red-700"
                      : "bg-yellow-50 text-yellow-700"
                }`}
              >
                Verdict: {result.verdict} — Margin:{" "}
                {result.profit_margin_percent}%
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-3">
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className={`font-bold text-lg ${color}`}>{value}</p>
    </div>
  );
}
