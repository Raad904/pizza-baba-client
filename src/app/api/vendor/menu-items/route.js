import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/auth";
import { requireVendor, jsonError, MENU_CATEGORIES } from "@/lib/vendor";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const FREE_PLAN_MAX_ACTIVE = 3;

/** Uploads a file to ImgBB and returns its URL (and delete URL). */
async function uploadToImgBB(file) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Image upload is not configured. Set IMGBB_API_KEY in .env (get a free key at api.imgbb.com)."
    );
  }

  const form = new FormData();
  form.append("key", apiKey);
  form.append("image", new Blob([await file.arrayBuffer()], { type: file.type }));

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error("ImgBB upload failed. Please try again.");
  }

  const json = await res.json();
  if (!json?.data?.url) {
    throw new Error("ImgBB upload failed. Please try again.");
  }

  return { url: json.data.url, deleteUrl: json.data.delete_url };
}

// GET /api/vendor/menu-items — the signed-in vendor's own items
export async function GET(request) {
  const { user, error } = await requireVendor(request);
  if (error) return error;

  const items = await db
    .collection("menuItems")
    .find({ vendorId: user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({ items });
}

// POST /api/vendor/menu-items — create (image uploaded to ImgBB, status Pending)
export async function POST(request) {
  const { user, error } = await requireVendor(request);
  if (error) return error;

  let form;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Expected multipart form data.", 400);
  }

  const name = (form.get("name") || "").toString().trim();
  const category = (form.get("category") || "").toString().trim();
  const description = (form.get("description") || "").toString().trim();
  const location = (form.get("location") || "").toString().trim();
  const price = Number(form.get("price"));
  const image = form.get("image");

  // Required-field validation
  if (!name) return jsonError("Item name is required.", 400);
  if (!category || !MENU_CATEGORIES.includes(category)) {
    return jsonError("Please choose a valid category.", 400);
  }
  if (!description) return jsonError("Description is required.", 400);
  if (!location) return jsonError("Location (area / city) is required.", 400);
  if (!Number.isFinite(price) || price <= 0) {
    return jsonError("Price must be a number greater than 0.", 400);
  }
  if (!image || typeof image === "string" || image.size === 0) {
    return jsonError("Item image is required.", 400);
  }
  if (!image.type?.startsWith("image/")) {
    return jsonError("Item image must be an image file.", 400);
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return jsonError("Image must be 5 MB or smaller.", 400);
  }

  // Free plan: max 3 active items. Premium: unlimited.
  const subscription = user.subscription || "free";
  if (subscription !== "premium") {
    const activeCount = await db.collection("menuItems").countDocuments({
      vendorId: user.id,
      available: true,
      status: { $ne: "Rejected" },
    });
    if (activeCount >= FREE_PLAN_MAX_ACTIVE) {
      return jsonError(
        `Free plan allows a maximum of ${FREE_PLAN_MAX_ACTIVE} active items. Upgrade to Premium for unlimited items.`,
        403
      );
    }
  }

  let uploaded;
  try {
    uploaded = await uploadToImgBB(image);
  } catch (err) {
    return jsonError(err.message || "Image upload failed.", 502);
  }

  const now = new Date().toISOString();
  const doc = {
    _id: randomUUID(),
    vendorId: user.id,
    name,
    category,
    description,
    price,
    location,
    imageUrl: uploaded.url,
    imageDeleteUrl: uploaded.deleteUrl || null,
    status: "Pending", // until an admin approves it
    available: true,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection("menuItems").insertOne(doc);

  return NextResponse.json({ item: doc }, { status: 201 });
}
