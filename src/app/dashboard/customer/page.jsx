
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

export default function CustomerOverviewPage() {
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!currentUser?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/customer/${encodeURIComponent(currentUser.id)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          const responseText = await response.text();

          console.error("Invalid API response:", responseText);

          throw new Error(
            "API returned HTML instead of JSON. Check your backend URL and route."
          );
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to fetch customer orders."
          );
        }

        if (!cancelled) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Customer Overview Error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, isPending]);

  const total = orders.length;

  const pending = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "pending"
  ).length;

  const accepted = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "accepted"
  ).length;

  const rejected = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "rejected"
  ).length;

  const cancelledCount = orders.filter(
    (order) => String(order.status || "").toLowerCase() === "cancelled"
  ).length;

  // Session loading
  if (isPending || loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">
            My Orders Overview
          </h1>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 animate-pulse"
              >
                <div className="h-4 w-24 rounded bg-zinc-200 mb-3" />
                <div className="h-8 w-12 rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">
            My Orders Overview
          </h1>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Please sign in to view your orders.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6 flex items-center justify-center">
        <div className="rounded-2xl bg-red-50 p-8 text-center shadow-sm ring-1 ring-red-100 max-w-md w-full">
          <AlertCircle className="mx-auto size-12 text-red-600 mb-3" />

          <h2 className="text-lg font-bold text-red-800">
            Could not load orders
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Overview
  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              My Orders Overview
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Track your orders across all statuses.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Total Orders"
            value={total}
            color="text-zinc-900"
            bg="bg-zinc-50"
          />

          <StatCard
            label="Pending"
            value={pending}
            color="text-amber-700"
            bg="bg-amber-50"
          />

          <StatCard
            label="Accepted"
            value={accepted}
            color="text-emerald-700"
            bg="bg-emerald-50"
          />

          <StatCard
            label="Rejected"
            value={rejected}
            color="text-red-700"
            bg="bg-red-50"
          />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">
            Quick Summary
          </h2>

          <div className="space-y-2">
            <SummaryRow
              label="Cancelled"
              value={cancelledCount}
            />

            <p className="text-sm text-zinc-500">
              You can cancel any pending order from the My Orders page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm ring-1 ring-zinc-100 ${bg}`}
    >
      <p className="text-sm font-semibold text-zinc-500 mb-1">
        {label}
      </p>

      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-zinc-900">
        {value}
      </span>
    </div>
  );
}
