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

// ── Auth interceptor ──────────────────────────────────────────────
// ClerkAuthProvider calls setTokenGetter() on mount with Clerk's getToken fn.
// Every outgoing request then attaches the Bearer token automatically.
let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // If token fetch fails, let the request go through — the server will 401
    }
  }
  return config;
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
