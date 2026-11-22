"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/app/imeges/logo.png";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/Browse-Menu" },
  { label: "Book a Table", href: "/book-table" },
  { label: "Dashboard", href: "/dashboard/customer" },
];

const INFO_LINKS = [
  { label: "About Us", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const CONTACT_ITEMS = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+880 1234 567890",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@pizzahub.com",
  },
  {
    icon: MapPin,
    label: "Visit Us",
    value: "Gulshan, Dhaka, Bangladesh",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon - Sun: 11:00 AM - 11:00 PM",
  },
];

export default function Footer() {
  return (
    <footer className="bg-cream border-t border-zinc-200/50 mt-auto">
      <motion.div
        variants={footerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-6xl px-5 py-12 sm:px-8"
      >
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image
                src={logo}
                alt="Pizza Baba"
                width={120}
                height={48}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Delivering fresh, delicious pizzas across the city since day one.
              It&rsquo;s not just food &mdash; it&rsquo;s an experience.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-600 hover:text-brand transition-colors border border-zinc-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-600 hover:text-brand transition-colors border border-zinc-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="2.5" x2="17.51" y2="2.5"></line></svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-600 hover:text-brand transition-colors border border-zinc-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-brand hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 mb-6">
              Company
            </h3>
            <ul className="space-y-3">
              {INFO_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-600 transition-colors hover:text-brand hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-lg font-bold text-zinc-900 mb-6">
              Contact
            </h3>
            <ul className="space-y-4">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-3">
                    <div className="w-5 h-5 flex-shrink-0 text-zinc-400 mt-0.5">
                      <Icon size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-900 font-medium">
                        {item.label}
                      </p>
                      <p className="text-sm text-zinc-500">{item.value}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            &copy; 2026 Pizza Baba. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-zinc-500">
            <span>Made with ❤️ in Dhaka</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
