"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, X, MapPin, CalendarDays, MessageSquare, User } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    fetch("/api/vendor/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders);
      })
      .catch(() => setError("Could not load orders."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (order, action) => {
    setBusyId(order._id);
    setError("");
    try {
      const res = await fetch(`/api/vendor/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Could not update the order.");
        return; // keep list as-is; server refused (e.g. already handled)
      }
      setOrders((prev) =>
        prev.map((o) => (o._id === json.order._id ? json.order : o))
      );
    } catch {
      setError("Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Customer Orders</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Pending orders can be accepted or rejected — each order can be handled only once.
      </p>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {!orders && !error && (
        <div className="mt-6 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      )}

      {orders && orders.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <p className="font-semibold text-zinc-800">No orders yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Orders from customers for your menu items will appear here.
          </p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li key={order._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {order.itemImage && (
                    <Image
                      src={order.itemImage}
                      alt={order.itemName}
                      width={56}
                      height={56}
                      className="size-14 rounded-xl object-cover"
                      unoptimized
                    />
                  )}
                  <div>
                    <p className="font-semibold text-zinc-900">{order.itemName}</p>
                    <p className="text-sm text-zinc-500">
                      ${Number(order.itemPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <User className="size-4 text-zinc-400" />
                  {order.customerName} · {order.customerEmail}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-zinc-400" />
                  Delivery: {order.deliveryDate}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-4 text-zinc-400" />
                  {order.deliveryAddress}
                </p>
                {order.customerMessage && (
                  <p className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-zinc-400" />
                    “{order.customerMessage}”
                  </p>
                )}
              </div>

              {order.status === "pending" && (
                <div className="mt-4 flex gap-3 border-t border-zinc-100 pt-4">
                  <button
                    type="button"
                    disabled={busyId === order._id}
                    onClick={() => resolve(order, "accept")}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Check className="size-4" /> {busyId === order._id ? "Working…" : "Accept"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === order._id}
                    onClick={() => resolve(order, "reject")}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <X className="size-4" /> Reject
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
