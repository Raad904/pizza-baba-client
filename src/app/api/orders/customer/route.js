import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { auth } from "@/lib/auth";

// GET /api/orders/customer — orders for the authenticated customer
export async function GET(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "customer") {
    return NextResponse.json(
      { error: "Only customers can view their orders." },
      { status: 403 }
    );
  }

  const orders = await db
    .collection("orders")
    .find({ customerId: user._id || user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ orders });
}
