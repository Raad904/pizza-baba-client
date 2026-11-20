"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/* ============================================================
 * API URL PLACEHOLDERS — add your server URLs later, e.g.:
 *   const getUpdateUrl = (id) => `${process.env.NEXT_PUBLIC_API_URL}/items/${id}`;
 * ============================================================ */
const getUpdateUrl = (id) => `${process.env.NEXT_PUBLIC_API_URL}/items/${id}`;

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

export function EditDialog({ item, onClose, onSaved }) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    location: "",
    image: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefill the form whenever a different item is picked
  useEffect(() => {
    if (!item) return;
    setForm({
      name: item.name || "",
      category: item.category || "",
      description: item.description || "",
      price: item.price ?? "",
      location: item.location || "",
      image: item.image || item.imageUrl || "",
    });
    setError("");
  }, [item]);

  // Lock scroll + close on Escape while open
  useEffect(() => {
    if (!item) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [item, saving, onClose]);

  if (!mounted || !item) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    // Validation (same rules as the Add Menu Item form)
    if (!form.name.trim()) return setError("Item name is required.");
    if (!form.category) return setError("Please choose a category.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!(Number(form.price) > 0)) return setError("Price must be greater than 0.");
    if (!form.location.trim()) return setError("Location is required.");
    if (!form.image.trim()) return setError("Item image URL is required.");

    try {
      const imageUrl = new URL(form.image.trim());
      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        return setError("Please enter a valid image URL.");
      }
    } catch {
      return setError("Please enter a valid image URL.");
    }

   const updateUrl = getUpdateUrl(item._id || item.id);

if (!updateUrl) {
  return setError("Save endpoint is not configured yet — add your server URL in EditDialog.jsx.");
}

setSaving(true);

try {
  const updatedData = {
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    location: form.location.trim(),
    image: form.image.trim(),
    price: Number(form.price),
  };

  const res = await fetch(updateUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Could not save the changes.");
  }

  const updatedItem = {
    ...item,
    ...updatedData,
  };

  onSaved?.(updatedItem);
  onClose();

} catch (err) {
  setError(err.message || "Something went wrong. Please try again.");
} finally {
  setSaving(false);
}
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit menu item"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={() => !saving && onClose()}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
      />

      {/* Panel — home page style: cream card, rounded shield shape, serif heading */}
      <div
        ref={panelRef}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[40px] bg-cream p-7 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-zinc-200/70 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-bold text-zinc-900">
              Edit Item
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Update your dish details and save when you&rsquo;re done.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={() => !saving && onClose()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-zinc-200 transition hover:text-brand"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Status badge (read-only) */}
        <span className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-600 ring-1 ring-zinc-200">
          Status: {item.status || "Pending"}
        </span>

        {/* Error */}
        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="mb-1.5 block text-sm font-semibold text-zinc-700">
              Item Name *
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="edit-category" className="mb-1.5 block text-sm font-semibold text-zinc-700">
              Category *
            </label>
            <select
              id="edit-category"
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className={inputCls}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="mb-1.5 block text-sm font-semibold text-zinc-700">
              Description *
            </label>
            <textarea
              id="edit-description"
              name="description"
              required
              rows={3}
              value={form.description}
              onChange={handleChange}
              className={inputCls}
            />
          </div>

          {/* Price + Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-price" className="mb-1.5 block text-sm font-semibold text-zinc-700">
                Price ($) *
              </label>
              <input
                id="edit-price"
                name="price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.price}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="edit-location" className="mb-1.5 block text-sm font-semibold text-zinc-700">
                Location (area / city) *
              </label>
              <input
                id="edit-location"
                name="location"
                type="text"
                required
                value={form.location}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="edit-image" className="mb-1.5 block text-sm font-semibold text-zinc-700">
              Item Image URL *
            </label>
            <input
              id="edit-image"
              name="image"
              type="url"
              required
              value={form.image}
              onChange={handleChange}
              className={inputCls}
            />

            {/* Live preview */}
            {form.image && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-3 h-32 w-full rounded-2xl object-cover ring-1 ring-zinc-200"
              />
            )}
          </div>

          {/* Actions — same pill buttons as the home hero */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand px-8 py-3 text-sm font-medium text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-full bg-white px-8 py-3 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200/70 transition hover:bg-zinc-50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default EditDialog;
