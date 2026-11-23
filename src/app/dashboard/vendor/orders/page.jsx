
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  X,
  MapPin,
  CalendarDays,
  MessageSquare,
  User,
  AlertCircle,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

// Backend API URL
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders/vendor`;

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-zinc-100 text-zinc-700",
};

export default function VendorOrdersPage() {
  const { data: session, isPending } = authClient.useSession();

  const currentUser = session?.user;

  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Fetch vendor orders
  const load = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      setError("");

      const res = await fetch(
        `${API_URL}/${encodeURIComponent(currentUser.id)}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const contentType = res.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("Backend returned HTML instead of JSON.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Could not load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders) ? data.orders : []
      );
    } catch (err) {
      console.error("Vendor Orders Error:", err);

      setError(err.message || "Could not load orders.");
      setOrders([]);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (isPending) return;

    if (!currentUser?.id) {
      setOrders([]);
      return;
    }

    load();
  }, [isPending, currentUser?.id, load]);

  // Accept or Reject order
  const resolve = async (order, action) => {
    if (!currentUser?.id) {
      setError("Please sign in to manage orders.");
      return;
    }

    setBusyId(order._id);
    setError("");

    try {
      // PATCH API URL
      const res = await fetch(
        `${API_URL}/${order._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendorId: currentUser.id,
            action: action,
          }),
        }
      );

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json.error || "Could not update the order."
        );
      }

      // Update order in frontend
      setOrders((prev) =>
        (prev || []).map((o) =>
          o._id === json.order._id
            ? json.order
            : o
        )
      );
    } catch (err) {
      console.error("Update Order Error:", err);

      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  // Loading
  if (isPending || orders === null) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Customer Orders
        </h1>

        <div className="mt-6 space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Customer Orders
        </h1>

        <p className="mt-4 text-sm text-zinc-500">
          Please sign in to view vendor orders.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        Customer Orders
      </h1>

      <p className="mt-1 text-sm text-zinc-500">
        Pending orders can be accepted or rejected.
        Each order can be handled only once.
      </p>

      {/* Error */}
      {error && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Empty orders */}
      {orders.length === 0 && !error && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <p className="font-semibold text-zinc-800">
            No orders yet
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Orders from customers for your menu items will appear here.
          </p>
        </div>
      )}

      {/* Orders list */}
      {orders.length > 0 && (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => {
            const status = String(
              order.status || "pending"
            ).toLowerCase();

            const price = Number(
              order.price ?? order.itemPrice ?? 0
            );

            return (
              <li
                key={order._id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100"
              >
                {/* Item information */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {order.itemImage && (
                      <Image
                        src={order.itemImage}
                        alt={order.itemName || "Menu item"}
                        width={56}
                        height={56}
                        className="size-14 rounded-xl object-cover"
                        unoptimized
                      />
                    )}

                    <div>
                      <p className="font-semibold text-zinc-900">
                        {order.itemName || "Menu Item"}
                      </p>

                      <p className="text-sm text-zinc-500">
                        ${price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order status */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      STATUS_STYLES[status] ||
                      STATUS_STYLES.pending
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Customer information */}
                <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <User className="size-4 shrink-0 text-zinc-400" />

                    {order.customerName || "Customer"}

                    {order.customerEmail
                      ? ` · ${order.customerEmail}`
                      : ""}
                  </p>

                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 shrink-0 text-zinc-400" />

                    Delivery:{" "}
                    {order.deliveryDate || "Within 24 hours"}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-zinc-400" />

                    {order.deliveryAddress || "—"}
                  </p>

                  {order.customerMessage && (
                    <p className="flex items-center gap-2">
                      <MessageSquare className="size-4 shrink-0 text-zinc-400" />

                      {order.customerMessage}
                    </p>
                  )}
                </div>

                {/* Accept / Reject buttons */}
                {status === "pending" && (
                  <div className="mt-4 flex gap-3 border-t border-zinc-100 pt-4">
                    <button
                      type="button"
                      disabled={busyId === order._id}
                      onClick={() =>
                        resolve(order, "accept")
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check className="size-4" />

                      {busyId === order._id
                        ? "Working..."
                        : "Accept"}
                    </button>

                    <button
                      type="button"
                      disabled={busyId === order._id}
                      onClick={() =>
                        resolve(order, "reject")
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="size-4" />

                      Reject
                    </button>
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
