"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import logo from "@/app/imeges/logo.png";
import { authClient } from "@/lib/auth-client";




const NavberPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { data: session } = authClient.useSession();


  const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/Browse-Menu" },
  { label: "Dashboard", href: `/dashboard/${session?.user?.role || 'customer'}` },
  
];

  // Close the avatar dropdown when clicking outside of it
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    setMenuOpen(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
  
{/* // Logo */}
<Link href="/" className="flex items-center">
  <Image
    src={logo}
    alt="Pizza Baba"
    width={160}
    height={65}
    priority
    className="h-14 w-auto object-contain"
  />
</Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className={
                  link.label === "Home"
                    ? "text-sm font-semibold text-brand"
                    : "text-sm font-medium text-zinc-700 transition-colors hover:text-brand"
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            aria-label="Cart"
            className="relative rounded-full p-1.5 text-zinc-900 transition-colors hover:text-brand"
          >
            <ShoppingCart className="size-6" strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
              2
            </span>
          </button>

          {session ? (
            /* Signed in → avatar with dropdown */
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Account menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full transition hover:opacity-80"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="size-9 rounded-full object-cover ring-2 ring-brand/40"
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white ring-2 ring-brand/40">
                    {(session.user.name || session.user.email || "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <ChevronDown className="size-4 text-zinc-700" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-zinc-200">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {session.user.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {session.user.email}
                    </p>
                    {session.user.role && (
                      <span className="mt-1.5 inline-block rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                        {session.user.role}
                      </span>
                    )}
                  </div>

                  <div className="my-1 h-px bg-zinc-100" />

                  <Link
                    href="/Dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Signed out → Sign Up button */
            <Link
              href="/SignUp"
              className="hidden rounded-full bg-brand px-7 py-2.5 text-sm font-medium text-white shadow-md shadow-brand/30 transition-colors hover:bg-brand-dark sm:inline-block"
            >
              Sign Up
            </Link>
          )}

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-1.5 text-zinc-900 md:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-zinc-200/70 px-5 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={
                    link.label === "Home"
                      ? "text-base font-semibold text-brand"
                      : "text-base font-medium text-zinc-700"
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {session ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-base font-semibold text-brand"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/SignUp"
                  onClick={() => setOpen(false)}
                  className="inline-block rounded-full bg-brand px-7 py-2.5 text-sm font-medium text-white"
                >
                  Sign Up
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default NavberPage;
