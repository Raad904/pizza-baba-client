import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { jsonError } from "@/lib/vendor";

// POST /api/orders — customers place an order for a menu item
export async function POST(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (user.role !== "customer") {
    return NextResponse.json(
      { error: "Only customers can place orders." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Expected JSON body.", 400);
  }

  const { itemId, deliveryAddress } = body;
  if (!itemId) {
    return jsonError("Item ID is required.", 400);
  }

  const item = await db.collection("menuItems").findOne({ _id: itemId });
  if (!item) {
    return jsonError("Menu item not found.", 404);
  }

  // Vendors cannot order their own items (defense in depth; dialog also guards).
  if (String(item.vendorId) === String(user.id)) {
    return jsonError("You cannot order your own items.", 403);
  }

  const order = {
    _id: randomUUID(),
    vendorId: item.vendorId,
    itemId: item._id,
    itemName: item.name,
    itemImage: item.image || item.imageUrl,
    itemPrice: item.price,
    customerId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    deliveryAddress: deliveryAddress || "",
    customerMessage: "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await db.collection("orders").insertOne(order);

  return NextResponse.json({ order }, { status: 201 });
}
