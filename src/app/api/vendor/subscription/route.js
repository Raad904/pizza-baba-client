import { NextResponse } from "next/server";
import { db } from "@/lib/auth";
import { requireVendor, jsonError } from "@/lib/vendor";

// POST /api/vendor/subscription — upgrade the vendor to Premium
export async function POST(request) {
  const { user, error } = await requireVendor(request);
  if (error) return error;

  if (user.subscription === "premium") {
    return jsonError("You are already on the Premium plan.", 400);
  }

  // `id` maps to `_id` in the Better Auth user collection.
  const result = await db.collection("user").updateOne(
    { _id: user.id },
    { $set: { subscription: "premium" } }
  );

  if (result.matchedCount === 0) {
    return jsonError("User not found.", 404);
  }

  return NextResponse.json({ subscription: "premium" });
}
