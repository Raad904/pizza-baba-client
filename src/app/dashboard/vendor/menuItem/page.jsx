
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import EditDialog from "@/components/EditDialog";
import { authClient } from "@/lib/auth-client";

/* ============================================================
 * API URL PLACEHOLDER — add your server URL later, e.g.:
 *   const DELETE_URL = (id) => `${process.env.NEXT_PUBLIC_API_URL}/items/${id}`;
 * ============================================================ */
const getDeleteUrl = (id) => `${process.env.NEXT_PUBLIC_API_URL}/items/${id}`;

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-600",
};



export default function MyMenuItemsPage() {
  const { data: session, isPending } = authClient.useSession();

const userId = session?.user?.id;
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // item opened in the EditDialog

// Get menu items by userId
const load = useCallback(async () => {
  try {
    setError("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/items/${userId}`
    );

    if (!res.ok) {
      throw new Error("Could not load your menu items.");
    }

    const data = await res.json();

    setItems(Array.isArray(data) ? data : data.items || []);

  } catch (error) {
    console.error("Load Menu Items Error:", error);
    setError(error.message || "Could not load your menu items.");
    setItems([]);
  }
}, [userId]);

useEffect(() => {
  if (!isPending && userId) {
    load();
  }
}, [load, userId, isPending]);



  // Toggle availability
  const toggleAvailability = async (item) => {
    setBusyId(item._id);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/items/${item._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            available: !item.available,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Could not update availability.");
      }

      await load();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId(null);
    }
  };

  // Delete menu item
  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    setBusyId(item._id);

    try {
      const deleteUrl = getDeleteUrl(item._id || item.id);

      // ⚠️ Placeholder not filled in yet — show a hint instead of a broken request
      if (!deleteUrl) {
        setError("Delete endpoint is not configured yet — add your server URL in this page.");
        return;
      }

      const res = await fetch(deleteUrl, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Could not delete the item.");
      }

      setItems((prev) =>
        prev.filter((i) => i._id !== item._id)
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            My Menu Items
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your pizza menu items here.
          </p>
        </div>

        <Link
          href="/dashboard/vendor/addItem"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="size-4" />
          Add Menu Item
        </Link>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Loading */}
      {!items && (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {items && items.length === 0 && !error && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <p className="font-semibold text-zinc-800">
            No menu items yet
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Create your first pizza item to get started.
          </p>

          <Link
            href="/dashboard/vendor/addItem"
            className="mt-4 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Add Menu Item
          </Link>
        </div>
      )}

      {/* Menu Items */}
      {items && items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item._id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100"
            >

              {/* Image */}
              <img
                src={item.image}
                alt={item.name}
                className="size-[72px] rounded-xl object-cover"
              />

              {/* Details */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-zinc-900">
                    {item.name}
                  </p>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[item.status] ||
                      "bg-zinc-100 text-zinc-600"
                      }`}
                  >
                    {item.status || "Pending"}
                  </span>

                  {item.available === false && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500">
                      Unavailable
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm text-zinc-500">
                  {item.category} · $
                  {Number(item.price).toFixed(2)} · {item.location}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">


                {/* Edit — opens the EditDialog */}
                <button
                  type="button"
                  title="Edit"
                  onClick={() => setEditing(item)}
                  className="flex size-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
                >
                  <Pencil className="size-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => deleteItem(item)}
                  title="Delete"
                  className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>

              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit dialog */}
      <EditDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          setItems((prevItems) =>
            (prevItems || []).map((item) => {
              const currentId = String(item._id || item.id);
              const updatedId = String(updated._id || updated.id);

              return currentId === updatedId
                ? { ...item, ...updated }
                : item;
            })
          );

          setEditing(null);
        }}
      />
    </div>
  );
}
