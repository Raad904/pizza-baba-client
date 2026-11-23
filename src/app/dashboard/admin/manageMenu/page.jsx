
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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Backend API URLs
const ITEMS_URL = `${process.env.NEXT_PUBLIC_API_URL}/items`;

const getStatusUrl = (id) =>
  `${ITEMS_URL}/${encodeURIComponent(id)}/status`;

const getDeleteUrl = (id) =>
  `${ITEMS_URL}/${encodeURIComponent(id)}`;

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

  // =========================================
  // GET ALL MENU ITEMS
  // GET /items
  // =========================================

  const load = useCallback(async () => {
    try {
      setError("");

      const res = await fetch(ITEMS_URL, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || "Could not load menu items."
        );
      }

      setItems(
        Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : []
      );
    } catch (err) {
      console.error("Load Menu Items Error:", err);

      setError(
        err.message || "Could not load menu items."
      );

      setItems([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // =========================================
  // SEARCH + FILTER
  // =========================================

  const filtered = useMemo(() => {
    if (!items) return [];

    const q = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !q ||
        (item.name || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (item.status || "Pending") === statusFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [items, search, statusFilter, categoryFilter]);

  // =========================================
  // CATEGORY OPTIONS
  // =========================================

  const categories = useMemo(() => {
    if (!items) return [];

    return [
      ...new Set(
        items.map((item) => item.category).filter(Boolean)
      ),
    ].sort();
  }, [items]);

  // =========================================
  // UPDATE STATUS
  // PATCH /items/:id/status
  // =========================================

  const updateStatus = async (item, status) => {
    const id = item._id || item.id;

    const label =
      status === "Approved"
        ? "approve"
        : status === "Rejected"
          ? "reject"
          : "change the status of";

    if (
      !confirm(
        `Are you sure you want to ${label} "${item.name}"?`
      )
    ) {
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const res = await fetch(getStatusUrl(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const responseText = await res.text();

      let json = {};

      try {
        json = JSON.parse(responseText);
      } catch {
        json = {};
      }

      console.log("PATCH URL:", getStatusUrl(id));
      console.log("Response Status:", res.status);
      console.log("Response Data:", json);

      if (!res.ok) {
        throw new Error(
          json.error ||
          json.message ||
          `Request failed with status ${res.status}`
        );
      }

      // Update frontend with backend response
      setItems((prev) =>
        (prev || []).map((currentItem) =>
          (currentItem._id || currentItem.id) === id
            ? {
              ...currentItem,
              ...(json.item || {}),
              status,
            }
            : currentItem
        )
      );

      setNotice(
        `"${item.name}" is now ${status}.`
      );
    } catch (err) {
      console.error("Update Menu Item Error:", err);

      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setBusyId(null);
    }
  };

  // =========================================
  // DELETE MENU ITEM
  // DELETE /items/:id
  // =========================================

  const deleteItem = async (item) => {
    const id = item._id || item.id;

    if (
      !confirm(
        `Delete "${item.name}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const res = await fetch(getDeleteUrl(id), {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json.error ||
          json.message ||
          "Could not delete the item."
        );
      }

      // Remove deleted item from frontend
      setItems((prev) =>
        (prev || []).filter(
          (currentItem) =>
            (currentItem._id || currentItem.id) !== id
        )
      );

      setNotice(`"${item.name}" deleted.`);
      toast.success("Menu item deleted.", {
        description: `"${item.name}" has been removed.`,
      });
    } catch (err) {
      console.error("Delete Menu Item Error:", err);

      setError(
        err.message || "Something went wrong."
      );
      toast.error("Could not delete the item.", {
        description: err.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (items === null) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Manage Menu Items
        </h1>

        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        Manage Menu Items
      </h1>

      <p className="mt-1 text-sm text-zinc-500">
        Review pending items, approve or reject them,
        update statuses, and delete inappropriate items.
        Only approved and active items show on the
        public Browse Menu.
      </p>

      {/* Error message */}
      {error && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Success message */}
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
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
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
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className={inputCls}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <UtensilsCrossed className="mx-auto size-8 text-zinc-300" />

          <p className="mt-3 font-semibold text-zinc-800">
            No menu items found
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {items.length === 0
              ? "No items have been submitted yet."
              : "Try a different search or filter."}
          </p>
        </div>
      )}

      {/* Items list */}
      {filtered.length > 0 && (
        <ul className="mt-6 space-y-4">
          {filtered.map((item) => {
            const id = item._id || item.id;
            const status = item.status || "Pending";
            const busy = busyId === id;
            const expanded = expandedId === id;

            const imageUrl =
              item.image || item.imageUrl;

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
                      alt={item.name || "Menu item"}
                      className="size-[72px] rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-[72px] items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                      <UtensilsCrossed className="size-6" />
                    </span>
                  )}

                  {/* Item details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">
                        {item.name || "Menu Item"}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[status] ||
                          "bg-zinc-100 text-zinc-600"
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
                      {item.category} · $
                      {Number(item.price || 0).toFixed(2)}{" "}
                      · {item.location}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {status === "Pending" && (
                      <>
                        {/* Approve */}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateStatus(item, "Approved")
                          }
                          title="Approve"
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}

                          Approve
                        </button>

                        {/* Reject */}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateStatus(item, "Rejected")
                          }
                          title="Reject"
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="size-3.5" />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Expand details */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expanded ? null : id
                        )
                      }
                      title="More actions"
                      className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
                    >
                      {expanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => deleteItem(item)}
                      title="Delete"
                      className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="mt-4 border-t border-zinc-100 pt-4">
                    <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-zinc-800">
                          Description:
                        </span>{" "}
                        {item.description || "—"}
                      </p>

                      <p>
                        <span className="font-semibold text-zinc-800">
                          Vendor ID:
                        </span>{" "}
                        {item.userId || "—"}
                      </p>

                      <p>
                        <span className="font-semibold text-zinc-800">
                          Vendor Email:
                        </span>{" "}
                        {item.userEmail || "—"}
                      </p>

                      <p>
                        <span className="font-semibold text-zinc-800">
                          Created:
                        </span>{" "}
                        {item.createdAt
                          ? new Date(
                            item.createdAt
                          ).toLocaleDateString()
                          : "—"}
                      </p>

                      <p>
                        <span className="font-semibold text-zinc-800">
                          Availability:
                        </span>{" "}
                        {item.available === false
                          ? "Unavailable"
                          : "Available"}
                      </p>
                    </div>

                    {/* Change status */}
                    {status !== "Pending" && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          Change status:
                        </span>

                        {[
                          "Approved",
                          "Rejected",
                          "Pending",
                        ].map((newStatus) => (
                          <button
                            key={newStatus}
                            type="button"
                            disabled={
                              busy || newStatus === status
                            }
                            onClick={() =>
                              updateStatus(item, newStatus)
                            }
                            className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${newStatus === status
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                              }`}
                          >
                            {newStatus}
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
