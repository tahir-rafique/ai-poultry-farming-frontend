"use client";

import { useEffect, useState } from "react";
import { farmsApi } from "@/lib/api";
import type { Farm } from "@/lib/types";
import { formatPKR, formatNumber, formatDate } from "@/lib/utils";
import { PlusCircle, Bird, Search, Trash2, Eye } from "lucide-react";
import Link from "next/link";

const STATUS_TABS = ["all", "active", "completed", "archived"] as const;

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await farmsApi.list(status === "all" ? undefined : status);
    setFarms(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [status]);

  const filtered = farms.filter((f) =>
    f.farm_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this farm batch? This cannot be undone.")) return;
    await farmsApi.delete(id);
    load();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title flex items-center gap-2"><Bird size={24} className="text-primary-600" /> Farm Batches</h1>
        <Link href="/farms/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New Batch
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by farm name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                status === tab ? "bg-white text-primary-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Bird size={40} className="mx-auto mb-3 opacity-30" />
            <p>No farm batches found.</p>
            <Link href="/farms/new" className="text-primary-600 text-sm hover:underline mt-2 inline-block">
              Create your first batch →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Farm Name</th>
                  <th className="px-4 py-3 font-medium">Chicks</th>
                  <th className="px-4 py-3 font-medium">Start Date</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Sell Price/kg</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{f.farm_name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatNumber(f.num_chicks)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(f.batch_start_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{f.expected_duration_days}d</td>
                    <td className="px-4 py-3 text-gray-600">{formatPKR(f.expected_selling_price_per_kg)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Link href={`/farms/${f.id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => handleDelete(f.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 size={15} />
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    archived:  "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] ?? "bg-gray-100"}`}>
      {status}
    </span>
  );
}
