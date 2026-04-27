import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-PK").format(n);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function verdictColor(verdict: string): string {
  switch (verdict) {
    case "Profitable": return "text-green-600";
    case "Loss":       return "text-red-600";
    default:           return "text-yellow-600";
  }
}

export function verdictBg(verdict: string): string {
  switch (verdict) {
    case "Profitable": return "bg-green-100 text-green-700 border-green-200";
    case "Loss":       return "bg-red-100 text-red-700 border-red-200";
    default:           return "bg-yellow-100 text-yellow-700 border-yellow-200";
  }
}
