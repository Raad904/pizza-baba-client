"use client";

import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";

const FREE_FEATURES = [
  "Max 3 active menu items",
  "Basic vendor dashboard",
  "Order management",
];

const PREMIUM_FEATURES = [
  "Unlimited active menu items",
  "Premium vendor badge",
  "Featured menu placement",
  "All Free features",
];

export default function VendorSubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/api/vendor/overview")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSubscription(data.subscription || "free");
      })
      .catch(() => setError("Could not load your plan."));
  }, []);

  const upgrade = async () => {
    setUpgrading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/vendor/subscription", { method: "POST" });
      const json = await res.json();
      if (!res.ok) return setError(json.error || "Upgrade failed.");
      setSubscription("premium");
      setNotice("You are now a Premium vendor! 🎉");
    } catch {
      setError("Something went wrong.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Subscription</h1>
      <p className="mt-1 text-sm text-zinc-500">Choose the plan that fits your store.</p>

      {subscription === null && !error && (
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-zinc-100" />
      )}

      {subscription && (
        <>
          {error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}
          {notice && (
            <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Free plan */}
            <div
              className={`relative rounded-3xl bg-white p-6 shadow-sm ring-2 ${
                subscription === "free" ? "ring-brand" : "ring-zinc-100"
              }`}
            >
              {subscription === "free" && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-white">
                  Current plan
                </span>
              )}
              <h2 className="text-lg font-bold text-zinc-900">Free</h2>
              <p className="mt-1 text-3xl font-bold text-zinc-900">
                $0<span className="text-sm font-medium text-zinc-400">/month</span>
              </p>
              <ul className="mt-5 space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-600">
                    <Check className="mt-0.5 size-4 shrink-0 text-zinc-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium plan */}
            <div
              className={`relative rounded-3xl bg-zinc-900 p-6 text-white shadow-lg ring-2 ${
                subscription === "premium" ? "ring-amber-400" : "ring-zinc-900"
              }`}
            >
              {subscription === "premium" && (
                <span className="absolute -top-3 left-6 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold text-zinc-900">
                  Current plan
                </span>
              )}
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-amber-400" />
                <h2 className="text-lg font-bold">Premium</h2>
              </div>
              <p className="mt-1 text-3xl font-bold">
                $9<span className="text-sm font-medium text-zinc-400">/month</span>
              </p>
              <ul className="mt-5 space-y-3">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                    <Check className="mt-0.5 size-4 shrink-0 text-amber-400" /> {f}
                  </li>
                ))}
              </ul>

              {subscription !== "premium" && (
                <button
                  type="button"
                  onClick={upgrade}
                  disabled={upgrading}
                  className="mt-6 w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
                >
                  {upgrading ? "Upgrading…" : "Upgrade to Premium"}
                </button>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-400">
            Demo checkout — upgrading takes effect immediately with no payment.
          </p>
        </>
      )}
    </div>
  );
}
