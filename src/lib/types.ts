// ── Farm ──────────────────────────────────────────────────────────
export type FarmStatus = "active" | "completed" | "archived";

export interface Farm {
  id: string;
  farm_name: string;
  num_chicks: number;
  batch_start_date: string;
  expected_duration_days: number;
  chick_price_per_unit: number;
  feed_cost_per_kg: number;
  expected_feed_per_bird_kg: number;
  medicine_cost_total: number;
  labor_cost_per_day: number;
  utilities_cost_total: number;
  expected_selling_price_per_kg: number;
  expected_mortality_rate: number;
  notes?: string;
  status: FarmStatus;
  actual_mortality?: number;
  actual_avg_weight_kg?: number;
  created_at: string;
  updated_at: string;
}

export interface FarmCreate {
  farm_name: string;
  num_chicks: number;
  batch_start_date: string;
  expected_duration_days: number;
  chick_price_per_unit: number;
  feed_cost_per_kg: number;
  expected_feed_per_bird_kg: number;
  medicine_cost_total: number;
  labor_cost_per_day: number;
  utilities_cost_total: number;
  expected_selling_price_per_kg: number;
  expected_mortality_rate: number;
  notes?: string;
}

// ── Prediction ────────────────────────────────────────────────────
export interface CostBreakdown {
  chick_cost: number;
  feed_cost: number;
  medicine_cost: number;
  labor_cost: number;
  utilities_cost: number;
  total_cost: number;
}

export interface PredictionInput {
  num_chicks: number;
  chick_price_per_unit: number;
  feed_cost_per_kg: number;
  expected_feed_per_bird_kg: number;
  medicine_cost_total: number;
  labor_cost_per_day: number;
  utilities_cost_total: number;
  expected_duration_days: number;
  expected_selling_price_per_kg: number;
  expected_mortality_rate: number;
  expected_avg_weight_kg: number;
  farm_id?: string;
}

export interface PredictionResult {
  id?: string;
  farm_id?: string;
  num_chicks: number;
  chick_price_per_unit: number;
  feed_cost_per_kg: number;
  expected_feed_per_bird_kg: number;
  medicine_cost_total: number;
  labor_cost_per_day: number;
  utilities_cost_total: number;
  expected_duration_days: number;
  expected_selling_price_per_kg: number;
  expected_mortality_rate: number;
  expected_avg_weight_kg: number;
  cost_breakdown: CostBreakdown;
  birds_sold: number;
  total_revenue: number;
  predicted_profit: number;
  profit_margin_percent: number;
  roi_percent: number;
  verdict: "Profitable" | "Break-even" | "Loss";
  verdict_color: "green" | "yellow" | "red";
  ml_predicted_profit: number;
  created_at: string;
}

// ── Cost Calculator ───────────────────────────────────────────────
export interface CostCalculation {
  cost_breakdown: CostBreakdown;
  breakdown_percentages: {
    chick_cost_pct: number;
    feed_cost_pct: number;
    medicine_cost_pct: number;
    labor_cost_pct: number;
    utilities_cost_pct: number;
  };
  birds_sold: number;
  total_revenue: number;
  gross_profit: number;
  profit_margin_percent: number;
  roi_percent: number;
  cost_per_bird: number;
  revenue_per_bird: number;
  verdict: string;
}

// ── Vaccination ───────────────────────────────────────────────────
export interface VaccinationEntry {
  day: number;
  vaccine_name: string;
  disease_target: string;
  method: string;
  notes: string;
}

export interface CareGuideline {
  week: number;
  title: string;
  temperature: string;
  feed_type: string;
  water: string;
  lighting: string;
  notes: string;
}

export interface FullSchedule {
  vaccination_schedule: VaccinationEntry[];
  care_guidelines: CareGuideline[];
  summary: {
    total_vaccinations: number;
    total_weeks: number;
    grow_out_days: number;
  };
}

// ── Dashboard Stats ───────────────────────────────────────────────
export interface DashboardStats {
  total_farms: number;
  active_farms: number;
  completed_farms: number;
  total_predictions: number;
  total_active_chicks: number;
  avg_predicted_profit: number;
  total_predicted_profit: number;
}

// ── Mortality ─────────────────────────────────────────────────────
export interface MortalityLog {
  id: string;
  farm_id: string;
  date: string;
  dead_count: number;
  cause?: string;
  notes?: string;
  created_at: string;
}
