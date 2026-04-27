"use client";

import { useEffect, useState } from "react";
import { farmsApi, predictionsApi } from "@/lib/api";
import type { DashboardStats, PredictionResult, Farm } from "@/lib/types";
import { formatPKR, formatNumber, formatDate, verdictBg } from "@/lib/utils";
import {
  Bird,
  TrendingUp,
  Activity,
  FlaskConical,
  PlusCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, f, p] = await Promise.all([
          farmsApi.stats(),
          farmsApi.list("active"),
          predictionsApi.list(),
        ]);
        setStats(s);
        setFarms(f.slice(0, 5));
        setPredictions(p.slice(0, 6));
      } catch {
        setError(
          "Could not connect to the API. Make sure the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const chartData = predictions
    .slice()
    .reverse()
    .map((p, i) => ({
      name: `#${i + 1}`,
      profit: p.predicted_profit,
      revenue: p.total_revenue,
      cost: p.cost_breakdown.total_cost,
    }));

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            AI-Powered Broiler Farm Management
          </p>
        </div>
        <Link href="/farms/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New Batch
        </Link>
      </div>

      {error && (
        <div className="card p-4 border-red-200 bg-red-50 flex items-center gap-3 text-red-700">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Bird className="text-primary-600" />}
          label="Active Farms"
          value={stats?.active_farms ?? 0}
          sub="batches running"
          bg="bg-primary-50"
        />
        <StatCard
          icon={<Activity className="text-blue-600" />}
          label="Total Chicks"
          value={formatNumber(stats?.total_active_chicks ?? 0)}
          sub="in active batches"
          bg="bg-blue-50"
        />
        <StatCard
          icon={<FlaskConical className="text-purple-600" />}
          label="Predictions Run"
          value={stats?.total_predictions ?? 0}
          sub="all time"
          bg="bg-purple-50"
        />
        <StatCard
          icon={<TrendingUp className="text-green-600" />}
          label="Avg Predicted Profit"
          value={formatPKR(stats?.avg_predicted_profit ?? 0)}
          sub="per prediction"
          bg="bg-green-50"
        />
      </div>

      {/* Chart + Recent Farms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <div className="card p-5">
          <h2 className="section-title mb-4">Recent Prediction Results</h2>
          {chartData.length === 0 ? (
            <EmptyState msg="No predictions yet. Run your first prediction!" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: number, name: string) => [
                    formatPKR(val),
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#86efac"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  dataKey="cost"
                  fill="#fca5a5"
                  radius={[4, 4, 0, 0]}
                  name="Cost"
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]} name="Profit">
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.profit >= 0 ? "#16a34a" : "#dc2626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Active Farms */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Active Batches</h2>
            <Link
              href="/farms"
              className="text-primary-600 text-sm flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {farms.length === 0 ? (
            <EmptyState msg="No active farm batches. Create your first batch!" />
          ) : (
            <ul className="space-y-3">
              {farms.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{f.farm_name}</p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(f.num_chicks)} chicks · Started{" "}
                      {formatDate(f.batch_start_date)}
                    </p>
                  </div>
                  <Link
                    href={`/farms/${f.id}`}
                    className="text-primary-600 text-xs hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Predictions</h2>
          <Link
            href="/history"
            className="text-primary-600 text-sm flex items-center gap-1 hover:underline"
          >
            Full history <ArrowRight size={14} />
          </Link>
        </div>
        {predictions.length === 0 ? (
          <EmptyState msg="No predictions yet. Use the AI Prediction page to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-left">
                  <th className="pb-2 font-medium">Chicks</th>
                  <th className="pb-2 font-medium">Total Cost</th>
                  <th className="pb-2 font-medium">Revenue</th>
                  <th className="pb-2 font-medium">Profit</th>
                  <th className="pb-2 font-medium">Verdict</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2">{formatNumber(p.num_chicks)}</td>
                    <td className="py-2">
                      {formatPKR(p.cost_breakdown.total_cost)}
                    </td>
                    <td className="py-2">{formatPKR(p.total_revenue)}</td>
                    <td
                      className={`py-2 font-semibold ${p.predicted_profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPKR(p.predicted_profit)}
                    </td>
                    <td className="py-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${verdictBg(p.verdict)}`}
                      >
                        {p.verdict}
                      </span>
                    </td>
                    <td className="py-2 text-gray-500">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  bg: string;
}) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div
        className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <p className="text-gray-400 text-sm text-center py-8">{msg}</p>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
    </div>
  );
}
