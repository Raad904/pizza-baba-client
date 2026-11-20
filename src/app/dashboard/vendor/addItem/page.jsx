
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const CATEGORIES = [
  "Margherita Pizza",
  "Pepperoni Pizza",
  "Cheese Pizza",
  "BBQ Chicken Pizza",
  "Hawaiian Pizza",
  "Veggie Pizza",
  "Meat Lovers Pizza",
  "Supreme Pizza",
  "Neapolitan Pizza",
  "Chicago Deep Dish Pizza",
  "New York Style Pizza",
  "Buffalo Chicken Pizza",
  "Mushroom Pizza",
  "Four Cheese Pizza",
  "Seafood Pizza",
];

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function AddMenuItemPage() {
  const router = useRouter();
  const {
    data: session,
    isPending
  
  } = authClient.useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form));

  // Get logged-in user from Better Auth session
  const user = session?.user;

  if (!user) {
    return setError("Please login before creating a menu item.");
  }

  // Validation
  if (!data.name?.trim()) {
    return setError("Item name is required.");
  }

  if (!data.category) {
    return setError("Please choose a category.");
  }

  if (!data.description?.trim()) {
    return setError("Description is required.");
  }

  if (!(Number(data.price) > 0)) {
    return setError("Price must be greater than 0.");
  }

  if (!data.location?.trim()) {
    return setError("Location is required.");
  }

  if (!data.image?.trim()) {
    return setError("Item image URL is required.");
  }

  try {
    const imageUrl = new URL(data.image.trim());

    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      return setError("Please enter a valid image URL.");
    }
  } catch {
    return setError("Please enter a valid image URL.");
  }

  setLoading(true);

  try {
    // Prepare menu item with user information
    const item = {
      name: data.name.trim(),
      category: data.category,
      description: data.description.trim(),
      price: Number(data.price),
      location: data.location.trim(),
      image: data.image.trim(),

      // Logged-in user information
      userId: user._id || user.id,
      userEmail: user.email,

      status: "Pending",
      createdAt: new Date(),
    };

    // Send data to Express Backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/additems`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      }
    );

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Could not create the menu item.");
    }

    form.reset();

    router.push("/dashboard/vendor/menuItem");

  } catch (error) {
    console.error("Add Menu Item Error:", error);

    setError(error.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">

      {/* Back Button */}
      <Link
        href="/dashboard/vendor"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-brand"
      >
        <ArrowLeft className="size-4" />
        Back to Overview
      </Link>

      {/* Heading */}
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        Add Menu Item
      </h1>

      <p className="mt-1 text-sm text-zinc-500">
        New items are saved as{" "}
        <span className="font-semibold text-amber-600">
          Pending
        </span>{" "}
        until an admin approves them.
      </p>

      {/* Error */}
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100"
      >

        {/* Item Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-semibold text-zinc-700"
          >
            Item Name *
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Margherita Pizza"
            className={inputCls}
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-semibold text-zinc-700"
          >
            Category *
          </label>

          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className={inputCls}
          >
            <option value="" disabled>
              Select a category
            </option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-semibold text-zinc-700"
          >
            Description *
          </label>

          <textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Describe your dish..."
            className={inputCls}
          />
        </div>

        {/* Price and Location */}
        <div className="grid gap-5 sm:grid-cols-2">

          <div>
            <label
              htmlFor="price"
              className="mb-1.5 block text-sm font-semibold text-zinc-700"
            >
              Price ($) *
            </label>

            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              placeholder="35.00"
              className={inputCls}
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-semibold text-zinc-700"
            >
              Location (area / city) *
            </label>

            <input
              id="location"
              name="location"
              type="text"
              required
              placeholder="e.g. Gulshan, Dhaka"
              className={inputCls}
            />
          </div>

        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="image"
            className="mb-1.5 block text-sm font-semibold text-zinc-700"
          >
            Item Image URL *
          </label>

          <div className="relative">
            <ImagePlus className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-zinc-400" />

            <input
              id="image"
              name="image"
              type="url"
              required
              placeholder="https://example.com/pizza-image.jpg"
              className={`${inputCls} pl-12`}
            />
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            Paste your food image URL here.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-brand/30 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Saving..."
            : "Create Menu Item"}
        </button>

      </form>
    </div>
  );
}
