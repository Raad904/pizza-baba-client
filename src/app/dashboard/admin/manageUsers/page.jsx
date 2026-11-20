"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldBan,
  ShieldCheck,
  Users,
  Mail,
  Calendar,
  Crown,
} from "lucide-react";

/* ============================================================
 * DATA FETCHING PLACEHOLDERS — add your server URLs later, e.g.:
 *   const USERS_URL = `${process.env.NEXT_PUBLIC_API_URL}/admin/users`;
 *   const ACTION_URL = (id) => `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`;
 * ============================================================ */
const USERS_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;

const getActionUrl = (id) => "";

const ROLE_STYLES = {
  admin: "bg-violet-100 text-violet-700",
  vendor: "bg-sky-100 text-sky-700",
  customer: "bg-emerald-100 text-emerald-700",
};

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function ManageUsersPage() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null); // user details

  // Get all users
  const load = useCallback(async () => {
    // ⚠️ Placeholder not filled in yet — nothing to fetch
    if (!USERS_URL) return;

    try {
      setError("");
      const res = await fetch(USERS_URL);
      if (!res.ok) throw new Error("Could not load users.");

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Load Users Error:", err);
      setError(err.message || "Could not load users.");
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Search by name or email + filter by role
  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();

    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Block / Unblock a user
  const toggleBlock = async (user) => {
    const action = user.blocked ? "unblock" : "block";

    if (
      !confirm(
        `${action === "block" ? "Block" : "Unblock"} ${
          user.name || user.email
        }? ${
          action === "block"
            ? "Blocked users cannot use protected features."
            : ""
        }`
      )
    ) {
      return;
    }

    setBusyId(user._id || user.id);
    setError("");
    setNotice("");

    try {
      const actionUrl = getActionUrl(user._id || user.id, action);

      // ⚠️ Placeholder not filled in yet — show a hint instead of a broken request
      if (!actionUrl) {
        setError("Action endpoint is not configured yet — add your server URL in this page.");
        return;
      }

      const res = await fetch(actionUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: action === "block" }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not update the user.");

      setUsers((prev) =>
        (prev || []).map((u) =>
          (u._id || u.id) === (user._id || user.id)
            ? { ...u, blocked: action === "block" }
            : u
        )
      );
      setNotice(
        `${user.name || user.email} ${
          action === "block" ? "blocked" : "unblocked"
        }.`
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-zinc-900">Manage Users</h1>
      <p className="mt-1 text-sm text-zinc-500">
        View user details, search, filter by role, and block or unblock users.
      </p>

      {/* Placeholder hint — remove once USERS_URL is configured */}
      {!USERS_URL && (
        <p className="mt-6 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 ring-1 ring-zinc-100">
          Data endpoint is not configured yet — add your server URL in{" "}
          <code className="font-mono text-zinc-700">manageUsers/page.jsx</code>.
        </p>
      )}

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      {/* Search + role filter */}
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-11`}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`${inputCls} sm:w-48`}
          aria-label="Filter by role"
        >
          <option value="all">All roles</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Loading skeleton */}
      {!users && USERS_URL && !error && (
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {users && filtered.length === 0 && (
        <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-100">
          <Users className="mx-auto size-8 text-zinc-300" />
          <p className="mt-3 font-semibold text-zinc-800">No users found</p>
          <p className="mt-1 text-sm text-zinc-500">
            {users.length === 0
              ? "No registered users yet."
              : "Try a different search or role filter."}
          </p>
        </div>
      )}

      {/* Users list */}
      {users && filtered.length > 0 && (
        <ul className="mt-6 space-y-4">
          {filtered.map((user) => {
            const id = user._id || user.id;
            const isBlocked = Boolean(user.blocked);
            const expanded = expandedId === id;

            return (
              <li
                key={id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Avatar / initial */}
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || user.email}
                      className="size-11 rounded-full object-cover ring-1 ring-zinc-100"
                    />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                      {(user.name || user.email || "?").charAt(0).toUpperCase()}
                    </span>
                  )}

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-900">
                        {user.name || "Unnamed user"}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${
                          ROLE_STYLES[user.role] || "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {user.role || "customer"}
                      </span>
                      {isBlocked && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
                          Blocked
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-zinc-500">
                      {user.email}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : id)}
                      className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-200"
                    >
                      {expanded ? "Hide details" : "View details"}
                    </button>

                    <button
                      type="button"
                      disabled={busyId === id}
                      onClick={() => toggleBlock(user)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                        isBlocked
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      {isBlocked ? (
                        <ShieldCheck className="size-3.5" />
                      ) : (
                        <ShieldBan className="size-3.5" />
                      )}
                      {busyId === id
                        ? "Working..."
                        : isBlocked
                          ? "Unblock"
                          : "Block"}
                    </button>
                  </div>
                </div>

                {/* User details */}
                {expanded && (
                  <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 text-sm text-zinc-600 sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <Mail className="size-4 text-zinc-400" />
                      {user.email}
                    </p>
                    <p className="flex items-center gap-2 capitalize">
                      <Crown className="size-4 text-zinc-400" />
                      Role: {user.role || "customer"}
                      {user.subscription ? ` · ${user.subscription} plan` : ""}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="size-4 text-zinc-400" />
                      Joined:{" "}
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldBan className="size-4 text-zinc-400" />
                      Status:{" "}
                      <span
                        className={
                          isBlocked ? "font-semibold text-red-600" : "font-semibold text-emerald-600"
                        }
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
