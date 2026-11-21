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

  const { itemId, deliveryAddress, itemName, itemImage, price, category, description, location, vendorId, vendorName, status, customerEmail, customerName } = body;
  if (!itemId) {
    return jsonError("Item ID is required.", 400);
  }

  // Verify the item exists and is not the customer's own item (defense in depth).
  const item = await db.collection("menuItems").findOne({ _id: itemId });
  if (!item) {
    return jsonError("Menu item not found.", 404);
  }

  if (String(item.vendorId) === String(user.id)) {
    return jsonError("You cannot order your own items.", 403);
  }

  const order = {
    _id: randomUUID(),
    vendorId: vendorId || item.vendorId,
    itemId: item._id,
    itemName: itemName || item.name,
    itemImage: itemImage || item.image || item.imageUrl,
    price: Number(price || item.price || 0),
    category: category || item.category,
    description: description || item.description,
    location: location || item.location,
    vendorName: vendorName || item.vendorName || item.userName || item.vendor?.name || item.user?.name || "Vendor",
    customerId: user._id || user.id,
    customerName: customerName || user.name,
    customerEmail: customerEmail || user.email,
    deliveryAddress: deliveryAddress || "",
    customerMessage: "",
    status: status || "Pending",
    createdAt: new Date().toISOString(),
  };

  await db.collection("orders").insertOne(order);

  return NextResponse.json({ order }, { status: 201 });
}
