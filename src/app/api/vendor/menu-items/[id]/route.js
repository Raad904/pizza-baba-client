import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { requireVendor, jsonError, MENU_CATEGORIES } from "@/lib/vendor";

async function getOwnItem(request, id) {
  const { user, error } = await requireVendor(request);
  if (error) return { error };

  const item = await db.collection("menuItems").findOne({ _id: id });
  if (!item) return { error: jsonError("Menu item not found.", 404) };
  // Vendors can only touch their own items.
  if (item.vendorId !== user.id) {
    return { error: jsonError("You can only manage your own menu items.", 403) };
  }
  return { user, item };
}

// PUT /api/vendor/menu-items/[id] — update fields / toggle availability
export async function PUT(request, { params }) {
  const { id } = await params;
  const { error, item } = await getOwnItem(request, id);
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Expected JSON body.", 400);
  }

  const updates = {};

  if (body.name !== undefined) {
    const name = body.name.toString().trim();
    if (!name) return jsonError("Item name cannot be empty.", 400);
    updates.name = name;
  }
  if (body.category !== undefined) {
    if (!MENU_CATEGORIES.includes(body.category)) {
      return jsonError("Please choose a valid category.", 400);
    }
    updates.category = body.category;
  }
  if (body.description !== undefined) {
    const description = body.description.toString().trim();
    if (!description) return jsonError("Description cannot be empty.", 400);
    updates.description = description;
  }
  if (body.location !== undefined) {
    const location = body.location.toString().trim();
    if (!location) return jsonError("Location cannot be empty.", 400);
    updates.location = location;
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return jsonError("Price must be a number greater than 0.", 400);
    }
    updates.price = price;
  }
  if (body.available !== undefined) {
    updates.available = Boolean(body.available);
  }

  if (Object.keys(updates).length === 0) {
    return jsonError("Nothing to update.", 400);
  }

  // Note: `status` (Pending/Approved/Rejected) is intentionally not editable here —
  // only admins approve or reject items.
  updates.updatedAt = new Date().toISOString();

  await db.collection("menuItems").updateOne(
    { _id: item._id },
    { $set: updates }
  );

  const updated = await db.collection("menuItems").findOne({ _id: item._id });
  return NextResponse.json({ item: updated });
}

// DELETE /api/vendor/menu-items/[id]
export async function DELETE(request, { params }) {
  const { id } = await params;
  const { error, item } = await getOwnItem(request, id);
  if (error) return error;

  await db.collection("menuItems").deleteOne({ _id: item._id });
  return NextResponse.json({ ok: true });
}
