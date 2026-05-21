"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BrainCircuit,
  Calculator,
  Syringe,
  ClipboardList,
  PlusCircle,
  Bird,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { user } = useUser();

  // Hide sidebar on auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
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
          const active =
            pathname === href ||
            (href !== "/dashboard" &&
              pathname.startsWith(href) &&
              href !== "/farms/new");
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

      {/* User section */}
      <div className="px-4 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 mb-3">
          {/* Clerk UserButton: avatar + dropdown with sign-out, profile, etc. */}
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "User"}
            </p>
            <p className="text-primary-400 text-xs truncate">
              {user?.emailAddresses?.[0]?.emailAddress ?? ""}
            </p>
          </div>
        </div>
        <p className="text-primary-500 text-xs">FYP — Broiler Poultry AI · v1.0.0</p>
      </div>
    </aside>
  );
}
