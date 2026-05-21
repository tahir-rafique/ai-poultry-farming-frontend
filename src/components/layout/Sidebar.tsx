"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  Calculator,
  Syringe,
  ClipboardList,
  PlusCircle,
  Bird,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/farms", label: "Farm Batches", icon: Bird },
  { href: "/farms/new", label: "New Batch", icon: PlusCircle },
  { href: "/predict", label: "AI Prediction", icon: BrainCircuit },
  { href: "/costs", label: "Cost Calculator", icon: Calculator },
  { href: "/schedule", label: "Vaccination", icon: Syringe },
  { href: "/history", label: "History", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-primary-800 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-primary-700">
        <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center text-xl">
          🐔
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">Smart Poultry</p>
          <p className="text-primary-300 text-xs">AI Farm Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = (() => {
            if (pathname === href) return true;           // exact match always wins
            if (href === "/dashboard") return false;      // dashboard: exact only
            if (href === "/farms/new") return false;      // new batch: exact only
            if (href === "/farms")                        // farms: sub-pages but NOT /farms/new
              return pathname.startsWith("/farms/") && !pathname.startsWith("/farms/new");
            return pathname.startsWith(href + "/");       // all others: sub-pages
          })();
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-600 text-white"
                  : "text-primary-200 hover:bg-primary-700 hover:text-white",
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-primary-700 space-y-3">
        {user && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-primary-200" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-primary-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-primary-300 hover:bg-primary-700 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>

        <p className="text-primary-500 text-xs">FYP — Broiler Poultry AI · v1.0.0</p>
      </div>
    </aside>
  );
}
