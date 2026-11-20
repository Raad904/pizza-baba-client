"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pizza, Upload } from "lucide-react";
import { authClient } from "@/lib/auth-client";

/* Big "shield" shape from the reference: rounded top, wide curved bottom */
const shield = {
  borderRadius: "32px 32px 50% 50% / 32px 32px 24% 24%",
};

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // keep profile images small (base64 in Mongo)

function TextInput({ name, type = "text", placeholder, autoComplete }) {
  return (
    <input
      name={name}
      type={type}
      required
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full rounded-full bg-white/15 px-6 py-3.5 text-sm text-white placeholder-white/70 outline-none transition focus:bg-white/25 focus:ring-2 focus:ring-white/50"
    />
  );
}

function SelectInput({ name, options, defaultValue }) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      required
      className="w-full cursor-pointer appearance-none rounded-full bg-white/15 px-6 py-3.5 text-sm text-white outline-none transition focus:bg-white/25 focus:ring-2 focus:ring-white/50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-zinc-900">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function PhotoInput({ name, label }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-3">
      {/* Option 1: paste a photo URL */}
      <input
        name={name}
        type="url"
        placeholder="Profile photo URL (optional)"
        className="w-full rounded-full bg-white/15 px-6 py-3.5 text-sm text-white placeholder-white/70 outline-none transition focus:bg-white/25 focus:ring-2 focus:ring-white/50"
      />

      {/* Option 2: upload a file from the device */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-full bg-white/15 px-6 py-3.5 text-sm text-white/80 transition hover:bg-white/25 focus:ring-2 focus:ring-white/50"
      >
        <Upload className="size-4 shrink-0" />
        <span className="truncate">{fileName || label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
      />
    </div>
  );
}

export function PromoCard() {
  return (
    <div
      style={shield}
      className="relative flex min-h-[560px] flex-col overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-950 px-9 pt-16 pb-14 text-white shadow-2xl"
    >
      {/* Delivery illustration */}
      <div className="flex items-center">
        <span className="text-4xl" aria-hidden>
          🛵
        </span>
        <span className="mx-3 h-0.5 flex-1 border-t-2 border-dashed border-white/40" />
        <span className="text-2xl" aria-hidden>
          📍
        </span>
      </div>

      <h2 className="mt-10 text-3xl font-bold tracking-widest">FOODY</h2>
      <p className="mt-2 text-2xl font-semibold tracking-wide text-white/90">
        FOOD DELIVERY SERVICE
      </p>
      <p className="mt-8 text-lg text-white/70">7 Days 24 Hours</p>

      <Link
        href="/"
        className="mt-auto pt-12 text-center text-2xl font-semibold text-rose-200 transition-colors hover:text-white"
      >
        Order Now!
      </Link>
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AuthSection({ title, mode, fields, footer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const showError = (text) => setMessage({ text, isError: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    console.log('from submit:',data);
    const url = (data.image || "").trim();
    const file = form.querySelector('input[type="file"]')?.files?.[0];
    

    if (file && file.size > MAX_IMAGE_BYTES) {
      showError("Profile image must be 2 MB or smaller.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        // Optional photo: an uploaded file wins over a pasted URL.
        let image;
        if (file) image = await fileToDataUrl(file);
        else if (url) image = url;

        const res = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
          image,
          role: data.role,
        });

        if (res.error) {
          showError(res.error.message || "Could not create the account.");
          return;
        }
      } else {
        const res = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

        if (res.error) {
          showError(res.error.message || "Invalid email or password.");
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      showError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={shield}
      className="flex min-h-[560px] flex-col items-center bg-gradient-to-b from-brand to-brand-dark px-9 pt-16 pb-12 text-white shadow-2xl shadow-brand/30"
    >
      <h1 className="text-2xl font-semibold uppercase tracking-[0.25em]">
        {title}
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xs space-y-5">
        {fields.map((field) =>
          field.type === "select" ? (
            <SelectInput key={field.name} {...field} />
          ) : field.type === "photo" ? (
            <PhotoInput key={field.name} {...field} />
          ) : (
            <TextInput key={field.name} {...field} />
          )
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white py-3.5 text-sm font-semibold text-brand shadow-md transition hover:bg-zinc-100 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center text-sm ${message.isError ? "text-amber-200" : "text-white/90"}`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <div className="mt-auto flex flex-col items-center gap-6 pt-10">
        {footer && <p className="text-center text-sm text-white/85">{footer}</p>}
        <Pizza className="size-16 text-white" strokeWidth={1.1} aria-hidden />
      </div>
    </div>
  );
}
