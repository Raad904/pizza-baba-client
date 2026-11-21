import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/vendor";

// DELETE /api/orders/[id] — cancel a pending order (owner only)
export async function DELETE(request, { params }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "customer") {
    return NextResponse.json(
      { error: "Only customers can cancel orders." },
      { status: 403 }
    );
  }

  const order = await db.collection("orders").findOne({ _id: id });
  if (!order) {
    return jsonError("Order not found.", 404);
  }

  // Customers cannot cancel another customer's order.
  if (String(order.customerId) !== String(user._id || user.id)) {
    return jsonError("You can only cancel your own orders.", 403);
  }

  // Cannot cancel an order that is already accepted, rejected, or cancelled.
  const status = String(order.status || "").toLowerCase();
  if (status !== "pending") {
    return jsonError(
      `Cannot cancel an order that is already ${status}.`,
      409
    );
  }

  await db.collection("orders").updateOne(
    { _id: id, status: "pending" },
    { $set: { status: "cancelled", cancelledAt: new Date().toISOString() } }
  );

  const updated = await db.collection("orders").findOne({ _id: id });
  return NextResponse.json({ order: updated });
}
