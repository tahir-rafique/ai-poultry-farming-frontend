import axios from "axios";
import type {
  Farm,
  FarmCreate,
  DashboardStats,
  PredictionInput,
  PredictionResult,
  CostCalculation,
  FullSchedule,
  MortalityLog,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// ── Farms ─────────────────────────────────────────────────────────
export const farmsApi = {
  list: (status?: string): Promise<Farm[]> =>
    api.get("/farms", { params: status ? { status } : {} }).then((r) => r.data),

  get: (id: string): Promise<Farm> =>
    api.get(`/farms/${id}`).then((r) => r.data),

  create: (data: FarmCreate): Promise<Farm> =>
    api.post("/farms", data).then((r) => r.data),

  update: (id: string, data: Partial<Farm>): Promise<Farm> =>
    api.put(`/farms/${id}`, data).then((r) => r.data),

  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/farms/${id}`).then((r) => r.data),

  stats: (): Promise<DashboardStats> =>
    api.get("/farms/stats").then((r) => r.data),
};

// ── Predictions ───────────────────────────────────────────────────
export const predictionsApi = {
  predict: (data: PredictionInput): Promise<PredictionResult> =>
    api.post("/predictions", data).then((r) => r.data),

  list: (farmId?: string): Promise<PredictionResult[]> =>
    api
      .get("/predictions", { params: farmId ? { farm_id: farmId } : {} })
      .then((r) => r.data),

  get: (id: string): Promise<PredictionResult> =>
    api.get(`/predictions/${id}`).then((r) => r.data),

  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/predictions/${id}`).then((r) => r.data),

  logMortality: (
    data: Omit<MortalityLog, "id" | "created_at">,
  ): Promise<MortalityLog> =>
    api.post("/predictions/mortality", data).then((r) => r.data),

  getMortalityLogs: (farmId: string): Promise<MortalityLog[]> =>
    api.get(`/predictions/mortality/${farmId}`).then((r) => r.data),
};

// ── Cost Calculator ───────────────────────────────────────────────
export const costsApi = {
  calculate: (data: PredictionInput): Promise<CostCalculation> =>
    api.post("/costs/calculate", data).then((r) => r.data),
};

// ── Schedules ─────────────────────────────────────────────────────
export const schedulesApi = {
  getFull: (): Promise<FullSchedule> =>
    api.get("/schedules/full").then((r) => r.data),
};
