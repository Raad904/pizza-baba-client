
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  MapPin,
  Store,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const ORDER_URL = `${process.env.NEXT_PUBLIC_API_URL}/orders`;

const isExternalUrl = (url) =>
  typeof url === "string" && url.startsWith("http");

const renderImage = (src, alt) => {
  if (!src) return null;

  if (isExternalUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt || "Menu item"}
        width={600}
        height={600}
        unoptimized
        className="w-full h-full object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "Menu item"}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
};

export function ItemDetailsDialog({ item }) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const currentUser = session?.user;

  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const images =
    Array.isArray(item?.images) && item.images.length > 0
      ? item.images
      : item?.image || item?.imageUrl
        ? [item.image || item.imageUrl]
        : [];

  const vendorName =
    item?.vendorName ||
    item?.userName ||
    item?.vendor?.name ||
    item?.user?.name ||
    "Vendor";

  const price = Number(item?.price || 0);

  const orderPermission = () => {
    if (isPending) return { ok: false, reason: "loading" };
    if (!currentUser) return { ok: false, reason: "login" };
    if (currentUser.role === "admin") return { ok: false, reason: "admin" };

    if (
      currentUser.role === "vendor" &&
      String(item.vendorId) === String(currentUser.id)
    ) {
      return { ok: false, reason: "own" };
    }

    return { ok: true };
  };

 const handleOrder = async (e) => {
  e.preventDefault();

  setOrderError("");
  setOrderSuccess(false);

  const perm = orderPermission();

  if (!perm.ok) {
    if (perm.reason === "login") {
      return setOrderError("Please sign in to place an order.");
    }

    if (perm.reason === "admin") {
      return setOrderError("Admins cannot place customer orders.");
    }

    if (perm.reason === "own") {
      return setOrderError("You cannot order your own items.");
    }

    return;
  }

  if (!deliveryAddress.trim()) {
    return setOrderError("Please enter your delivery address.");
  }

  setOrdering(true);

  try {
    const res = await fetch(ORDER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        itemId: item._id || item.id,
        itemName: item.name,
        itemImage: item.image || item.images?.[0] || "",
        price: Number(item.price || 0),
        category: item.category || "",
        description: item.description || "",
        location: item.location || "",
        vendorId: item.userId || item.vendorId || null,
        vendorName:
          item.vendorName ||
          item.userName ||
          item.vendor?.name ||
          item.user?.name ||
          "Vendor",
        status: "Pending",
        customerId: currentUser._id || currentUser.id,
        customerEmail: currentUser.email,
        customerName: currentUser.name,
        deliveryAddress: deliveryAddress.trim(),
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return setOrderError(
        json.error || json.message || "Could not place the order."
      );
    }

    setOrderSuccess(true);
  } catch (error) {
    setOrderError("Something went wrong. Please try again.");
  } finally {
    setOrdering(false);
  }
};
  const disabled =
    ordering ||
    !currentUser ||
    currentUser.role === "admin" ||
    (currentUser.role === "vendor" &&
      String(item?.vendorId) === String(currentUser.id)) ||
    isPending;

  if (!item) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Item details"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close dialog"
        onClick={() => router.back()}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Panel */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[40px] bg-cream p-7 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-zinc-200/70 sm:p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-3xl font-bold text-zinc-900">
              {item.name || "Unnamed Item"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500 flex items-center gap-1.5">
              {item.category && <span>{item.category}</span>}

              {item.category && item.location && (
                <span className="text-zinc-400">·</span>
              )}

              {item.location && <span>{item.location}</span>}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={() => router.back()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-700 shadow-md ring-1 ring-zinc-200 transition hover:text-brand"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Image Gallery */}
        <div className="mb-6">
          {images.length > 0 && (
            <div className="relative">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3">
                {renderImage(images[activeImage], item.name)}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`Image ${i + 1}`}
                      className={`relative flex shrink-0 size-10 rounded-xl border-2 overflow-hidden ${
                        activeImage === i
                          ? "border-brand"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {renderImage(src, "")}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="col-span-full">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Category
            </p>
            <p className="text-lg text-zinc-900">{item.category}</p>
          </div>

          <div className="col-span-full">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Price
            </p>
            <p className="text-lg font-bold text-brand">
              ৳{price.toLocaleString()}
            </p>
          </div>

          <div className="col-span-full">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Location
            </p>
            <p className="flex items-center gap-2 text-lg text-zinc-900">
              <MapPin className="size-4 shrink-0" />
              {item.location}
            </p>
          </div>

          <div className="col-span-full">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Vendor
            </p>
            <p className="flex items-center gap-2 text-lg text-zinc-900">
              <Store className="size-4 shrink-0" />
              {vendorName}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Description
          </p>

          <p className="text-lg text-zinc-900 leading-relaxed">
            {item.description || "No description available."}
          </p>
        </div>

        {/* Order Section */}
        <div className="mt-auto pt-6 border-t border-zinc-200">
          {orderSuccess && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100 mb-4">
              <CheckCircle className="size-5 shrink-0" />
              <span>Order placed successfully!</span>
            </div>
          )}

          {orderError && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100 mb-4">
              <AlertCircle className="size-5 shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          <form onSubmit={handleOrder} className="space-y-3">
            {!currentUser && (
              <p className="text-sm text-zinc-500">
                Sign in to place an order.
              </p>
            )}

            {currentUser?.role === "admin" && (
              <p className="text-sm text-zinc-500">
                Admins cannot place customer orders.
              </p>
            )}

            {currentUser?.role === "vendor" &&
              String(item.vendorId) === String(currentUser.id) && (
                <p className="text-sm text-zinc-500">
                  You cannot order your own items.
                </p>
              )}

            {currentUser?.role === "customer" && (
              <>
                <div>
                  <label
                    htmlFor="order-delivery-address"
                    className="mb-1.5 block text-sm font-semibold text-zinc-700"
                  >
                    Delivery address
                  </label>

                  <input
                    id="order-delivery-address"
                    type="text"
                    placeholder="e.g. House 12, Road 5, Gulshan, Dhaka"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={disabled}
                  className="w-full rounded-full bg-brand px-8 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {ordering ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Placing order...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ItemDetailsDialog;
