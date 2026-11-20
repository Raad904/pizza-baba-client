"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Check,
  X,
  Trash2,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ============================================================
 * DATA FETCHING PLACEHOLDERS — add your server URLs later, e.g.:
 *   const ITEMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/menu-items`;
 *   const ACTION_URL = (id) => `${process.env.NEXT_PUBLIC_API_URL}/admin/menu-items/${id}`;
 * ============================================================ */
const ITEMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/items`; // 👈 leave empty for now
const getActionUrl = () => ""; // 👈 leave empty for now

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-600",
};

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function ManageMenuItemsPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  // Get all submitted items
  const load = useCallback(async () => {
    // ⚠️ Placeholder not filled in yet — nothing to fetch
    if (!ITEMS_URL) return;

    try {
      setError("");
      const res = await fetch(ITEMS_URL);
      if (!res.ok) throw new Error("Could not load menu items.");

      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error("Load Menu Items Error:", err);
      setError(err.message || "Could not load menu items.");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Search by name + filter by status / category
  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || (item.status || "Pending") === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, search, statusFilter, categoryFilter]);

  // Distinct categories for the filter dropdown (derived from data)
  const categories = useMemo(() => {
    if (!items) return [];
    return [...new Set(items.map((i) => i.category).filter(Boolean))].sort();
  }, [items]);

  // Approve / Reject / change status
  const updateStatus = async (item, status) => {
    const label =
      status === "Approved" ? "approve" : status === "Rejected" ? "reject" : "change the status of";

    if (!confirm(`Are you sure you want to ${label} "${item.name}"?`)) return;

    setBusyId(item._id || item.id);
    setError("");
    setNotice("");

    try {
      const actionUrl = getActionUrl(item._id || item.id);

      // ⚠️ Placeholder not filled in yet — show a hint instead of a broken request
      if (!actionUrl) {
        setError("Action endpoint is not configured yet — add your server URL in this page.");
        return;
      }

      const res = await fetch(actionUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not update the item.");

      setItems((prev) =>
        (prev || []).map((i) =>
          (i._id || i.id) === (item._id || item.id) ? { ...i, status } : i
        )
      );
      setNotice(`"${item.name}" is now ${status}.`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  // Delete an inappropriate item
  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    setBusyId(item._id || item.id);
    setError("");
    setNotice("");

    try {
      const actionUrl = getActionUrl(item._id || item.id);

      // ⚠️ Placeholder not filled in yet — show a hint instead of a broken request
      if (!actionUrl) {
        setError("Action endpoint is not configured yet — add your server URL in this page.");
        return;
      }

      const res = await fetch(actionUrl, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not delete the item.");

      const id = item._id || item.id;
      setItems((prev) => (prev || []).filter((i) => (i._id || i.id) !== id));
      setNotice(`"${item.name}" deleted.`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Manage Menu Items</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Review pending items, approve or reject them, update statuses, and delete
        inappropriate items. Only approved and active items show on the public
        Browse Menu.
      </p>

      {/* Placeholder hint — remove once ITEMS_URL is configured */}
      {!ITEMS_URL && (
        <p className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 ring-1 ring-zinc-100">
          Data endpoint is not configured yet — add your server URL in{" "}
          <code className="font-mono text-zinc-700">manageMenu/page.jsx</code>.
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {/* Search + filters */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-11`}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputCls}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={inputCls}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Loading skeleton */}
      {!items && ITEMS_URL && !error && (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {items && filtered.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <UtensilsCrossed className="mx-auto size-8 text-zinc-300" />
          <p className="mt-3 font-semibold text-zinc-800">No menu items found</p>
          <p className="mt-1 text-sm text-zinc-500">
            {items.length === 0
              ? "No items have been submitted yet."
              : "Try a different search or filter."}
          </p>
        </div>
      )}

      {/* Items list */}
      {items && filtered.length > 0 && (
        <ul className="mt-6 space-y-4">
          {filtered.map((item) => {
            const id = item._id || item.id;
            const status = item.status || "Pending";
            const busy = busyId === id;
            const expanded = expandedId === id;
            const imageUrl = item.image || item.imageUrl;

            return (
              <li
                key={id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Image */}
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="size-[72px] rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-[72px] items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                      <UtensilsCrossed className="size-6" />
                    </span>
                  )}

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          STATUS_STYLES[status] || "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {status}
                      </span>
                      {item.available === false && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {item.category} · ${Number(item.price || 0).toFixed(2)} ·{" "}
                      {item.location}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {status === "Pending" && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(item, "Approved")}
                          title="Approve"
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <Check className="size-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(item, "Rejected")}
                          title="Reject"
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          <X className="size-3.5" /> Reject
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : id)}
                      title="More actions"
                      className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
                    >
                      {expanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => deleteItem(item)}
                      title="Delete"
                      className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Extra actions: change status of published items + full details */}
                {expanded && (
                  <div className="mt-4 border-t border-zinc-100 pt-4">
                    <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-zinc-800">Description:</span>{" "}
                        {item.description || "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-zinc-800">Vendor ID:</span>{" "}
                        {item.vendorId || "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-zinc-800">Created:</span>{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-zinc-800">Availability:</span>{" "}
                        {item.available === false ? "Unavailable" : "Available"}
                      </p>
                    </div>

                    {/* Status change for published (non-pending) items */}
                    {status !== "Pending" && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Change status:
                        </span>
                        {["Approved", "Rejected", "Pending"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={busy || s === status}
                            onClick={() => updateStatus(item, s)}
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-40 ${
                              s === status
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
