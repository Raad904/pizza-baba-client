"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, ArrowLeftRight, Lock } from "lucide-react";

/* ============================================================
 * DATA FETCHING PLACEHOLDER — add your server URL later, e.g.:
 *   const TRANSACTIONS_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/transactions`;
 * ============================================================ */
const TRANSACTIONS_URL = ""; // 👈 leave empty for now

const STATUS_STYLES = {
  success: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-600",
};

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Get all transactions (read-only)
  const load = useCallback(async () => {
    // ⚠️ Placeholder not filled in yet — nothing to fetch
    if (!TRANSACTIONS_URL) return;

    try {
      setError("");
      const res = await fetch(TRANSACTIONS_URL);
      if (!res.ok) throw new Error("Could not load transactions.");

      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : data.transactions || []);
    } catch (err) {
      console.error("Load Transactions Error:", err);
      setError(err.message || "Could not load transactions.");
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Search by vendor name / email / plan
  const filtered = useMemo(() => {
    if (!transactions) return [];
    const q = search.trim().toLowerCase();

    return transactions.filter((t) => {
      const vendor = t.vendorName || t.vendor?.name || "";
      const email = t.vendorEmail || t.vendor?.email || "";
      const plan = t.plan || t.subscription || "";
      return (
        !q ||
        vendor.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        String(plan).toLowerCase().includes(q)
      );
    });
  }, [transactions, search]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Transactions</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Payment records are read-only — transaction data cannot be edited here.
      </p>

      {/* Placeholder hint — remove once TRANSACTIONS_URL is configured */}
      {!TRANSACTIONS_URL && (
        <p className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 ring-1 ring-zinc-100">
          Data endpoint is not configured yet — add your server URL in{" "}
          <code className="font-mono text-zinc-700">transactions/page.jsx</code>.
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Read-only badge */}
      <div className="mt-6 flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 ring-1 ring-zinc-100">
        <Lock className="size-4 text-zinc-400" />
        Admins cannot modify payment records (e.g. mark a failed payment as
        successful).
      </div>

      {/* Search */}
      <div className="relative mt-4">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          placeholder="Search by vendor name, email, or plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} pl-11`}
        />
      </div>

      {/* Loading skeleton */}
      {!transactions && TRANSACTIONS_URL && !error && (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {transactions && filtered.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <ArrowLeftRight className="mx-auto size-8 text-zinc-300" />
          <p className="mt-3 font-semibold text-zinc-800">No transactions found</p>
          <p className="mt-1 text-sm text-zinc-500">
            {transactions.length === 0
              ? "No payments have been recorded yet."
              : "Try a different search."}
          </p>
        </div>
      )}

      {/* Desktop table */}
      {transactions && filtered.length > 0 && (
        <>
          <div className="mt-6 hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-100 md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-3.5">Vendor</th>
                  <th className="px-5 py-3.5">Subscription Plan</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Payment Status</th>
                  <th className="px-5 py-3.5">Transaction Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const id = t._id || t.id;
                  const status = String(t.status || t.paymentStatus || "pending").toLowerCase();
                  return (
                    <tr key={id} className="border-b border-zinc-50 last:border-0">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-zinc-900">
                          {t.vendorName || t.vendor?.name || "—"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {t.vendorEmail || t.vendor?.email || ""}
                        </p>
                      </td>
                      <td className="px-5 py-4 capitalize text-zinc-600">
                        {t.plan || t.subscription || "free"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-900">
                        ${Number(t.amount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                            STATUS_STYLES[status] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-600">
                        {t.createdAt || t.date
                          ? new Date(t.createdAt || t.date).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-6 space-y-4 md:hidden">
            {filtered.map((t) => {
              const id = t._id || t.id;
              const status = String(t.status || t.paymentStatus || "pending").toLowerCase();
              return (
                <li
                  key={id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {t.vendorName || t.vendor?.name || "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {t.vendorEmail || t.vendor?.email || ""}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                        STATUS_STYLES[status] || "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-600">
                    <p>
                      <span className="block text-xs font-semibold uppercase text-zinc-400">
                        Plan
                      </span>
                      <span className="capitalize">
                        {t.plan || t.subscription || "free"}
                      </span>
                    </p>
                    <p>
                      <span className="block text-xs font-semibold uppercase text-zinc-400">
                        Amount
                      </span>
                      <span className="font-semibold text-zinc-900">
                        ${Number(t.amount ?? 0).toFixed(2)}
                      </span>
                    </p>
                    <p className="col-span-2">
                      <span className="block text-xs font-semibold uppercase text-zinc-400">
                        Date
                      </span>
                      {t.createdAt || t.date
                        ? new Date(t.createdAt || t.date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
