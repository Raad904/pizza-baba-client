import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { requireVendor } from "@/lib/vendor";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Same URLs the vendor dashboard pages use:
//   menuItem page  -> GET `${NEXT_PUBLIC_API_URL}/items/${userId}`
//   orders page    -> GET `${NEXT_PUBLIC_API_URL}/orders/vendor/${userId}`
//   addItem page   -> POST `${NEXT_PUBLIC_API_URL}/additems` (create only, no list)
const itemsUrl = (userId) => `${API_URL}/items/${userId}`;
const ordersUrl = (userId) => `${API_URL}/orders/vendor/${userId}`;

const toList = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
};

// Fetch a list from the external API and return its contents
async function fetchList(url, key) {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok || !contentType.includes("application/json")) {
    throw new Error(`Bad response from ${url}`);
  }

  return toList(await res.json(), key);
}

const orderStatus = (order) => String(order.status || "").toLowerCase();

// GET /api/vendor/overview — dashboard stats for the signed-in vendor
export async function GET(request) {
  const { user, error } = await requireVendor(request);
  if (error) return error;

  let items = [];
  let orders = [];
  let source = "api";

  try {
    [items, orders] = await Promise.all([
      fetchList(itemsUrl(user.id), "items"),
      fetchList(ordersUrl(user.id), "orders"),
    ]);
  } catch {
    // External API unreachable — fall back to MongoDB directly
    source = "database";
    [items, orders] = await Promise.all([
      db.collection("menuItems").find({ vendorId: user.id }).toArray(),
      db.collection("orders").find({ vendorId: user.id }).toArray(),
    ]);
  }

  const stats = {
    totalItems: items.length,
    activeItems: items.filter(
      (item) =>
        item.available === true &&
        String(item.status || "") !== "Rejected"
    ).length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => orderStatus(o) === "pending").length,
    acceptedOrders: orders.filter((o) => orderStatus(o) === "accepted").length,
    rejectedOrders: orders.filter((o) => orderStatus(o) === "rejected").length,
    subscription: user.subscription || "free",
    source,
  };

  return NextResponse.json(stats);
}
