import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { requireVendor } from "@/lib/vendor";

// GET /api/vendor/orders — orders for the signed-in vendor's own items
export async function GET(request) {
  const { user, error } = await requireVendor(request);
  if (error) return error;

  const orders = await db
    .collection("orders")
    .find({ vendorId: user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ orders });
}
