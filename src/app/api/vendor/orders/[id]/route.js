import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { requireVendor, jsonError } from "@/lib/vendor";

// PATCH /api/vendor/orders/[id] — accept or reject a pending order, once
export async function PATCH(request, { params }) {
  const { id } = await params;
  const { user, error } = await requireVendor(request);
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Expected JSON body.", 400);
  }

  const action = body.action;
  if (!["accept", "reject"].includes(action)) {
    return jsonError("Action must be 'accept' or 'reject'.", 400);
  }

  const order = await db.collection("orders").findOne({ _id: id });
  if (!order) return jsonError("Order not found.", 404);

  // Vendors cannot modify orders that belong to other vendors.
  if (order.vendorId !== user.id) {
    return jsonError("This order belongs to another vendor.", 403);
  }

  // Only pending orders can be accepted or rejected, and only once.
  if (order.status !== "pending") {
    return jsonError(
      `This order was already ${order.status}. Only pending orders can be changed.`,
      409
    );
  }

  const status = action === "accept" ? "accepted" : "rejected";
  await db.collection("orders").updateOne(
    { _id: order._id, status: "pending" }, // guard: only if still pending
    { $set: { status, resolvedAt: new Date().toISOString() } }
  );

  const updated = await db.collection("orders").findOne({ _id: order._id });
  return NextResponse.json({ order: updated });
}
