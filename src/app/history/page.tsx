"use client";

import { useEffect, useState } from "react";
import { predictionsApi } from "@/lib/api";
import type { PredictionResult } from "@/lib/types";
import { formatPKR, formatNumber, formatDate, verdictBg } from "@/lib/utils";
import { ClipboardList, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await predictionsApi.list();
    setPredictions(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prediction record?")) return;
    setDeleting(id);
    await predictionsApi.delete(id);
    await load();
    setDeleting(null);
  };

  const chartData = [...predictions].reverse().map((p, i) => ({
    index: i + 1,
    profit: p.predicted_profit,
    revenue: p.total_revenue,
    cost: p.cost_breakdown.total_cost,
  }));

  const profitable = predictions.filter((p) => p.predicted_profit > 0).length;
  const loss = predictions.filter((p) => p.predicted_profit < 0).length;
  const avgProfit = predictions.length
    ? predictions.reduce((s, p) => s + p.predicted_profit, 0) /
      predictions.length
    : 0;

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <ClipboardList size={24} className="text-primary-600" /> Prediction
          History
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          All past profit/loss predictions
        </p>
      </div>

      {/* Summary row */}
      {predictions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Predictions"
            value={predictions.length}
            color="text-gray-800"
          />
          <SummaryCard
            label="Profitable"
            value={profitable}
            color="text-green-600"
            icon={<TrendingUp size={14} />}
          />
          <SummaryCard
            label="Loss Predictions"
            value={loss}
            color="text-red-600"
            icon={<TrendingDown size={14} />}
          />
          <SummaryCard
            label="Avg Profit"
            value={formatPKR(avgProfit)}
            color={avgProfit >= 0 ? "text-green-600" : "text-red-600"}
          />
        </div>
      )}

      {/* Chart */}
      {predictions.length > 1 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">Profit Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="index"
                tick={{ fontSize: 11 }}
                label={{
                  value: "Prediction #",
                  position: "insideBottom",
                  offset: -2,
                  fontSize: 11,
                }}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(v: number) => formatPKR(v)} />
              <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Profit"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#60a5fa"
                strokeWidth={1.5}
                dot={false}
                name="Revenue"
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#f87171"
                strokeWidth={1.5}
                dot={false}
                name="Cost"
                strokeDasharray="4 2"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {predictions.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-20" />
            <p>No predictions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Chicks</th>
                  <th className="px-4 py-3 font-medium">Total Cost</th>
                  <th className="px-4 py-3 font-medium">Revenue</th>
                  <th className="px-4 py-3 font-medium">Rule Profit</th>
                  <th className="px-4 py-3 font-medium">ML Profit</th>
                  <th className="px-4 py-3 font-medium">ROI</th>
                  <th className="px-4 py-3 font-medium">Verdict</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{formatNumber(p.num_chicks)}</td>
                    <td className="px-4 py-3 text-red-600">
                      {formatPKR(p.cost_breakdown.total_cost)}
                    </td>
                    <td className="px-4 py-3 text-blue-600">
                      {formatPKR(p.total_revenue)}
                    </td>
                    <td
                      className={`px-4 py-3 font-semibold ${p.predicted_profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPKR(p.predicted_profit)}
                    </td>
                    <td
                      className={`px-4 py-3 ${p.ml_predicted_profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPKR(p.ml_predicted_profit)}
                    </td>
                    <td className="px-4 py-3">{p.roi_percent}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${verdictBg(p.verdict)}`}
                      >
                        {p.verdict}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id!)}
                        disabled={deleting === p.id}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
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

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
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
