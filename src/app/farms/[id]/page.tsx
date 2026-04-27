"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { farmsApi, predictionsApi } from "@/lib/api";
import type { Farm, PredictionResult, MortalityLog } from "@/lib/types";
import { formatPKR, formatNumber, formatDate, verdictBg } from "@/lib/utils";
import {
  ChevronLeft,
  Bird,
  TrendingUp,
  Activity,
  Trash2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function FarmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [mortalityLogs, setMortalityLogs] = useState<MortalityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  // Mortality log form
  const [mortDate, setMortDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [mortCount, setMortCount] = useState(0);
  const [mortCause, setMortCause] = useState("");
  const [loggingMort, setLoggingMort] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [f, p, m] = await Promise.all([
          farmsApi.get(id),
          predictionsApi.list(id),
          predictionsApi.getMortalityLogs(id),
        ]);
        setFarm(f);
        setPredictions(p);
        setMortalityLogs(m);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this farm? This cannot be undone.")) return;
    await farmsApi.delete(id);
    router.push("/farms");
  };

  const handleComplete = async () => {
    setCompleting(true);
    await farmsApi.update(id, { status: "completed" });
    const updated = await farmsApi.get(id);
    setFarm(updated);
    setCompleting(false);
  };

  const handleLogMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingMort(true);
    await predictionsApi.logMortality({
      farm_id: id,
      date: mortDate,
      dead_count: mortCount,
      cause: mortCause,
    });
    const logs = await predictionsApi.getMortalityLogs(id);
    setMortalityLogs(logs);
    setMortCount(0);
    setMortCause("");
    setLoggingMort(false);
  };

  const totalDead = mortalityLogs.reduce((sum, l) => sum + l.dead_count, 0);
  const mortalityRate = farm
    ? ((totalDead / farm.num_chicks) * 100).toFixed(1)
    : "0";

  if (loading) return <Loader />;
  if (!farm) return <div className="p-6 text-gray-500">Farm not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/farms"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Bird size={22} className="text-primary-600" />
              {farm.farm_name}
            </h1>
            <p className="text-gray-500 text-sm">
              Started {formatDate(farm.batch_start_date)} ·{" "}
              {farm.expected_duration_days} days ·{" "}
              <span className="capitalize font-medium text-primary-600">
                {farm.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {farm.status === "active" && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <CheckCircle size={15} /> {completing ? "..." : "Mark Complete"}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="btn-danger flex items-center gap-2 text-sm"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard label="Total Chicks" value={formatNumber(farm.num_chicks)} />
        <InfoCard
          label="Chick Price"
          value={formatPKR(farm.chick_price_per_unit) + "/chick"}
        />
        <InfoCard
          label="Selling Price"
          value={formatPKR(farm.expected_selling_price_per_kg) + "/kg"}
        />
        <InfoCard
          label="Mortality Rate (est.)"
          value={`${farm.expected_mortality_rate}%`}
        />
      </div>

      {/* Cost Overview */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Cost Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {[
            [
              "Chick Cost",
              formatPKR(farm.num_chicks * farm.chick_price_per_unit),
            ],
            [
              "Feed Cost",
              formatPKR(
                farm.num_chicks *
                  farm.expected_feed_per_bird_kg *
                  farm.feed_cost_per_kg,
              ),
            ],
            ["Medicine", formatPKR(farm.medicine_cost_total)],
            [
              "Labor",
              formatPKR(farm.labor_cost_per_day * farm.expected_duration_days),
            ],
            ["Utilities", formatPKR(farm.utilities_cost_total)],
          ].map(([label, val]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="font-semibold text-gray-800 mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mortality Tracker */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Activity size={18} className="text-red-500" /> Mortality Tracker
          </h2>
          <div className="text-sm text-gray-600">
            Total dead:{" "}
            <span className="font-bold text-red-600">{totalDead}</span> /{" "}
            {formatNumber(farm.num_chicks)} ({mortalityRate}%)
          </div>
        </div>
        <form
          onSubmit={handleLogMortality}
          className="flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="label text-xs">Date</label>
            <input
              className="input text-sm w-36"
              type="date"
              value={mortDate}
              onChange={(e) => setMortDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs">Dead Count</label>
            <input
              className="input text-sm w-24"
              type="number"
              min={0}
              value={mortCount}
              onChange={(e) => setMortCount(+e.target.value)}
            />
          </div>
          <div>
            <label className="label text-xs">Cause (optional)</label>
            <input
              className="input text-sm w-40"
              placeholder="e.g. Disease, Heat"
              value={mortCause}
              onChange={(e) => setMortCause(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loggingMort}
            className="btn-primary text-sm"
          >
            {loggingMort ? "Logging..." : "Log Mortality"}
          </button>
        </form>
        {mortalityLogs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Dead</th>
                  <th className="text-left pb-2 font-medium">Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mortalityLogs.map((l) => (
                  <tr key={l.id}>
                    <td className="py-1.5">{l.date}</td>
                    <td className="py-1.5 text-red-600 font-semibold">
                      {l.dead_count}
                    </td>
                    <td className="py-1.5 text-gray-500">{l.cause ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Related Predictions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600" /> Predictions
            for this Batch
          </h2>
          <Link href={`/predict?farm_id=${id}`} className="btn-primary text-sm">
            Run Prediction
          </Link>
        </div>
        {predictions.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            No predictions yet for this batch.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="text-left pb-2 font-medium">Cost</th>
                  <th className="text-left pb-2 font-medium">Revenue</th>
                  <th className="text-left pb-2 font-medium">Profit</th>
                  <th className="text-left pb-2 font-medium">ROI</th>
                  <th className="text-left pb-2 font-medium">Verdict</th>
                  <th className="text-left pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {predictions.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2">
                      {formatPKR(p.cost_breakdown.total_cost)}
                    </td>
                    <td className="py-2">{formatPKR(p.total_revenue)}</td>
                    <td
                      className={`py-2 font-semibold ${p.predicted_profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatPKR(p.predicted_profit)}
                    </td>
                    <td className="py-2">{p.roi_percent}%</td>
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 mt-1">{value}</p>
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
