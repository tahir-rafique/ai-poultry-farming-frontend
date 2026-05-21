/**
 * Auth token helpers — localStorage-based token management.
 * All reads/writes go through these helpers so it's easy to
 * swap to cookies later if needed.
 */

const TOKEN_KEY = "poultry_access_token";
const USER_KEY  = "poultry_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  farm_name?: string | null;
  created_at: string;
}

// ── Token ─────────────────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── User ──────────────────────────────────────────────────────────
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ── Clear all auth data ───────────────────────────────────────────
export function clearAuth(): void {
  removeToken();
  removeStoredUser();
}
