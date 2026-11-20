import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/** Returns the Better Auth session user for this request, or null. */
export async function getSessionUser(request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

/** Requires an authenticated vendor. Returns { user } or { error } response. */
export async function requireVendor(request) {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  if (user.role !== "vendor") {
    return { error: NextResponse.json({ error: "Vendor access only." }, { status: 403 }) };
  }
  return { user };
}

/** Requires any signed-in user. Returns { user } or { error } response. */
export async function requireUser(request) {
  const user = await getSessionUser(request);
  if (!user) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  return { user };
}

export const MENU_CATEGORIES = [
  "Pizza",
  "Pasta",
  "Burger",
  "Sandwich",
  "Salad",
  "Dessert",
  "Drink",
  "Other",
];

export function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}
