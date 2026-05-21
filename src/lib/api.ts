import axios from "axios";
import { getToken } from "./auth";
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
// Attaches the JWT from localStorage to every outgoing request.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ──────────────────────────────────────────────────────────
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  farm_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    farm_name?: string | null;
    created_at: string;
  };
}

export const authApi = {
  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post("/auth/register", data).then((r) => r.data),

  login: (data: LoginData): Promise<AuthResponse> =>
    api.post("/auth/login", data).then((r) => r.data),

  me: (): Promise<AuthResponse["user"]> =>
    api.get("/auth/me").then((r) => r.data),

  forgotPassword: (email: string): Promise<{ message: string }> =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (token: string, new_password: string): Promise<{ message: string }> =>
    api.post("/auth/reset-password", { token, new_password }).then((r) => r.data),
};

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
