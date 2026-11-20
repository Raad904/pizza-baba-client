"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Clock,
  CircleCheck,
  Crown,
  PlusCircle,
  ClipboardList,
} from "lucide-react";

const cards = [
  { key: "totalItems", label: "Total Menu Items", icon: Package, color: "text-zinc-700" },
  { key: "activeItems", label: "Active Menu Items", icon: CheckCircle2, color: "text-emerald-600" },
  { key: "pendingOrders", label: "Pending Customer Orders", icon: Clock, color: "text-amber-600" },
  { key: "acceptedOrders", label: "Accepted Orders", icon: CircleCheck, color: "text-sky-600" },
];

export default function VendorOverviewPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/vendor/overview")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError("Could not load overview."));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Vendor Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">Overview of your store performance</p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {!stats && !error && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.key} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <div
                key={c.key}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100"
              >
                <div className="flex items-center justify-between">
                  <span className={`flex size-10 items-center justify-center rounded-xl bg-zinc-50 ${c.color}`}>
                    <c.icon className="size-5" />
                  </span>
                  <span className="text-3xl font-bold text-zinc-900">{stats[c.key]}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-500">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Subscription plan */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-900 p-6 text-white">
            <div className="flex items-center gap-3">
              <Crown className={`size-6 ${stats.subscription === "premium" ? "text-amber-400" : "text-zinc-400"}`} />
              <div>
                <p className="text-sm text-zinc-400">Current subscription plan</p>
                <p className="text-xl font-bold capitalize">
                  {stats.subscription === "premium" ? "Premium" : "Free"}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/vendor/subscription"
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              {stats.subscription === "premium" ? "Manage Plan" : "Upgrade to Premium"}
            </Link>
          </div>

          {/* Quick actions */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/vendor/addItem"
              className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:ring-brand/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <PlusCircle className="size-5" />
              </span>
              <span>
                <span className="block font-semibold text-zinc-900">Add Menu Item</span>
                <span className="text-sm text-zinc-500">Create a new dish for your menu</span>
              </span>
            </Link>
            <Link
              href="/dashboard/vendor/orders"
              className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:ring-brand/40"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <ClipboardList className="size-5" />
              </span>
              <span>
                <span className="block font-semibold text-zinc-900">Customer Orders</span>
                <span className="text-sm text-zinc-500">Accept or reject pending orders</span>
              </span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
