"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Store,
  ShoppingBag,
  UtensilsCrossed,
  Clock,
  ArrowLeftRight,
} from "lucide-react";

/* ============================================================
 * DATA FETCHING PLACEHOLDER — add your server URL later, e.g.:
 *   const OVERVIEW_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/overview`;
 * ============================================================ */
const OVERVIEW_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`; // 👈 leave empty for now

const cards = [
  { key: "totalUsers", label: "Total Registered Users", icon: Users, color: "text-zinc-700" },
  { key: "totalVendors", label: "Total Vendors", icon: Store, color: "text-sky-600" },
  { key: "totalCustomers", label: "Total Customers", icon: ShoppingBag, color: "text-emerald-600" },
  { key: "totalMenuItems", label: "Total Menu Items", icon: UtensilsCrossed, color: "text-zinc-700" },
  { key: "pendingMenuItems", label: "Pending Menu Items", icon: Clock, color: "text-amber-600" },
  { key: "totalTransactions", label: "Total Transactions", icon: ArrowLeftRight, color: "text-violet-600" },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // ⚠️ Placeholder not filled in yet — nothing to fetch
    if (!OVERVIEW_URL) return;

    fetch(OVERVIEW_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError("Could not load overview."));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Overview of your platform
      </p>

      {/* Placeholder hint — remove once OVERVIEW_URL is configured */}
      {!OVERVIEW_URL && (
        <p className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 ring-1 ring-zinc-100">
          Data endpoint is not configured yet — add your server URL in{" "}
          <code className="font-mono text-zinc-700">dashboard/admin/page.jsx</code>.
        </p>
      )}

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {!stats && OVERVIEW_URL && !error && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.key} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      )}

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.key}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl bg-zinc-50 ${c.color}`}
                >
                  <c.icon className="size-5" />
                </span>
                <span className="text-3xl font-bold text-zinc-900">
                  {stats[c.key] ?? 0}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
