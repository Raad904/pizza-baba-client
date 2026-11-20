import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { requireVendor } from "@/lib/vendor";

// GET /api/vendor/overview — dashboard stats for the signed-in vendor
export async function GET(request) {
  const { user, error } = await requireVendor(request);
  if (error) return error;

  const [totalItems, activeItems, pendingOrders, acceptedOrders] =
    await Promise.all([
      db.collection("menuItems").countDocuments({ vendorId: user.id }),
      db.collection("menuItems").countDocuments({
        vendorId: user.id,
        available: true,
        status: { $ne: "Rejected" },
      }),
      db.collection("orders").countDocuments({
        vendorId: user.id,
        status: "pending",
      }),
      db.collection("orders").countDocuments({
        vendorId: user.id,
        status: "accepted",
      }),
    ]);

  return NextResponse.json({
    totalItems,
    activeItems,
    pendingOrders,
    acceptedOrders,
    subscription: user.subscription || "free",
  });
}
