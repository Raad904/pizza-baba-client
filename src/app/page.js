"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BadgePercent, Star } from "lucide-react";

import DishCarousel from "@/components/DishCarousel";
import CategorySection from "@/components/CategorySection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TestimonialsSection from "@/components/TestimonialsSection";

import heroImage from "@/app/imeges/pepperoni-pizza-slice.png.png";

const avatars = [
  "/food/avatar1.jpg",
  "/food/avatar2.jpg",
  "/food/avatar3.jpg",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">

      {/* ===== Hero Section ===== */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-2 lg:gap-6 lg:pt-16"
      >

        {/* Left — Copy */}
        <div className="max-w-xl">
          <h1 className="font-serif text-5xl font-bold leading-[1.05] text-zinc-900 sm:text-6xl lg:text-[4.4rem]">
            it&rsquo;s not just Food, It&rsquo;s an Experience.
          </h1>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="/menu"
              className="rounded-full bg-brand px-9 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
            >
              View Menu
            </a>

            <a
              href="/book-table"
              className="rounded-full bg-white px-9 py-3.5 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-zinc-200/70 transition hover:bg-zinc-50"
            >
              Book A Table
            </a>
          </div>

          {/* Reviews */}
          <div className="mt-12">
            <p className="text-sm font-semibold text-zinc-800">
              Reviews
            </p>

            <div className="mt-3 flex items-center">
              <div className="flex -space-x-3">
                {avatars.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`Reviewer ${i + 1}`}
                    width={36}
                    height={36}
                    className="size-9 rounded-full object-cover ring-2 ring-cream"
                  />
                ))}

                <span className="flex size-9 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white ring-2 ring-cream">
                  87+
                </span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="size-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Hero Image */}
        <div className="relative mx-auto w-fit">

          <div className="relative size-[320px] sm:size-[420px] lg:size-[480px]">

            <Image
              src={heroImage}
              alt="Pepperoni Pizza"
              fill
              priority
              sizes="(max-width: 640px) 320px, 480px"
              className="object-contain drop-shadow-2xl"
            />

          </div>

          {/* Discount Badge */}
          <div className="absolute -top-3 left-2 sm:left-4">
            <div className="relative rounded-2xl bg-white/95 px-5 py-3 shadow-xl backdrop-blur">

              <span className="absolute -top-4 -right-4 flex size-9 items-center justify-center rounded-full bg-white text-zinc-800 shadow-md">
                <BadgePercent
                  className="size-5"
                  strokeWidth={1.8}
                />
              </span>

              <p className="text-xl font-bold leading-none text-brand">
                5%
              </p>

              <p className="mt-1 text-[11px] leading-tight text-zinc-500">
                Discount{" "}
                <span className="font-semibold text-zinc-700">
                  for 2 orders
                </span>
              </p>

            </div>
          </div>
        </div>
      </motion.section>

      {/* ===== Dish Carousel (Featured Menu Items) ===== */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mx-auto max-w-6xl px-5 pb-20 sm:px-8"
      >
        <DishCarousel />
      </motion.section>

      {/* ===== Explore by Category ===== */}
      <CategorySection />

      {/* ===== Why Choose PizzaHub? ===== */}
      <WhyChooseSection />

      {/* ===== Customer Testimonials ===== */}
      <TestimonialsSection />

    </main>
  );
}
