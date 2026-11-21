
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Trash2,
  CalendarDays,
  MapPin,
  Store,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-700",
};

export default function CustomerOrdersPage() {
  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  // Fetch customer orders using customerUserId
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
        console.log(response);
        
        
        const contentType = response.headers.get("content-type");
        console.log('from console log',contentType);

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
          console.error("Customer Orders Error:", err);
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

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setCancelling(orderId);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not cancel the order.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );
    } catch (err) {
      console.error("Cancel Order Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  // Loading
  if (isPending || loading) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">
            My Orders
          </h1>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-zinc-100 animate-pulse"
              />
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
            My Orders
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
  if (error && orders.length === 0) {
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

  // No orders
  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-zinc-50 p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-zinc-900 mb-6">
            My Orders
          </h1>

          <div className="rounded-2xl bg-white p-12 shadow-sm ring-1 ring-zinc-100 text-center">
            <Clock className="mx-auto size-12 text-zinc-300 mb-4" />

            <h3 className="text-lg font-bold text-zinc-900">
              No orders yet
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              You haven&apos;t placed any orders. Browse the menu to get started.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Orders list
  return (
    <main className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            My Orders
          </h1>

          <p className="text-sm text-zinc-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <ul className="space-y-4">
          {orders.map((order) => {
            const requestDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "—";

            return (
              <li
                key={order._id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-[150px]">
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

                    <div className="min-w-0">
                      <p className="font-semibold text-zinc-900 leading-tight">
                        {order.itemName || "Unnamed Item"}
                      </p>

                      <p className="text-sm text-zinc-500 truncate">
                        {order.vendorName || "Unknown vendor"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      STATUS_STYLES[order.status?.toLowerCase()] ||
                      STATUS_STYLES.pending
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <Store className="size-4 text-zinc-400" />

                    <span className="font-medium text-zinc-900">
                      {order.vendorName || "Unknown vendor"}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-zinc-400" />

                    <span className="font-medium text-zinc-900">
                      {order.deliveryDate || "—"}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-zinc-400" />

                    <span className="font-medium text-zinc-900 truncate">
                      {order.deliveryAddress || "—"}
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock className="size-4 text-zinc-400" />

                    <span className="font-medium text-zinc-900">
                      {requestDate}
                    </span>
                  </p>
                </div>

                {order.status?.toLowerCase() === "pending" && (
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <button
                      type="button"
                      disabled={cancelling === order._id}
                      onClick={() => cancelOrder(order._id)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelling === order._id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Cancelling...
                        </span>
                      ) : (
                        <>
                          <Trash2 className="size-4" />
                          Cancel Order
                        </>
                      )}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
