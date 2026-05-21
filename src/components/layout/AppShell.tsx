"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

// Pages that don't require auth and have no sidebar
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, isAuthPage, router]);

  // Auth pages — just render children with centered bg, no sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        {children}
      </div>
    );
  }

  // Loading state — avoid flash
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing (redirect is in progress)
  if (!isAuthenticated) return null;

  // Authenticated app pages — sidebar + main content
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
