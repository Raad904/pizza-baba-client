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
 * Same URLs the admin pages use:
 *   manageUsers  -> GET `${NEXT_PUBLIC_API_URL}/user`
 *   manageMenu   -> GET `${NEXT_PUBLIC_API_URL}/items`
 *   transactions -> GET `${NEXT_PUBLIC_API_URL}/admin/transactions`
 *                  (documented endpoint in transactions/page.jsx)
 * ============================================================ */
const USERS_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;
const ITEMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/items`;
const TRANSACTIONS_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions`;

const cards = [
  { key: "totalUsers", label: "Total Registered Users", icon: Users, color: "text-zinc-700" },
  { key: "totalVendors", label: "Total Vendors", icon: Store, color: "text-sky-600" },
  { key: "totalCustomers", label: "Total Customers", icon: ShoppingBag, color: "text-emerald-600" },
  { key: "totalMenuItems", label: "Total Menu Items", icon: UtensilsCrossed, color: "text-zinc-700" },
  { key: "pendingMenuItems", label: "Pending Menu Items", icon: Clock, color: "text-amber-600" },
  { key: "totalTransactions", label: "Total Transactions", icon: ArrowLeftRight, color: "text-violet-600" },
];

// Same response shapes the pages accept: [] or { [key]: [] }
const toList = (data, key) =>
  Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];

const fetchList = (url, key) =>
  fetch(url, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json();
    })
    .then((data) => toList(data, key));

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchList(USERS_URL, "users"),
      fetchList(ITEMS_URL, "items"),
      fetchList(TRANSACTIONS_URL, "transactions"),
    ])
      .then((results) => {
        if (cancelled) return;

        // Only fail if every source is unreachable
        if (results.every((r) => r.status === "rejected")) {
          setError("Could not load overview.");
          return;
        }

        const valueAt = (i) =>
          results[i].status === "fulfilled" ? results[i].value : [];

        const users = valueAt(0);
        const items = valueAt(1);
        const transactions = valueAt(2);

        setStats({
          totalUsers: users.length,
          totalVendors: users.filter((u) => u.role === "vendor").length,
          totalCustomers: users.filter((u) => u.role === "customer").length,
          totalMenuItems: items.length,
          pendingMenuItems: items.filter(
            (item) => String(item.status || "") === "Pending"
          ).length,
          totalTransactions: transactions.length,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Could not load overview.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Overview of your platform
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Loading skeleton */}
      {!stats && !error && (
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
