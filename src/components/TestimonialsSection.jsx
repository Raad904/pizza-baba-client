"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Rahim Uddin",
    role: "Regular Customer",
    avatar: "/food/avatar1.jpg",
    rating: 5,
    text:
      "Best pizza I&rsquo;ve had in Dhaka. The crust is perfectly crisp and the toppings are always fresh.",
  },
  {
    name: "Fatema Akter",
    role: "Food Blogger",
    avatar: "/food/avatar2.jpg",
    rating: 5,
    text:
      "The vegetarian pizzas are amazing! So many great options and the delivery is super fast.",
  },
  {
    name: "Karim Hossain",
    role: "Corporate Client",
    avatar: "/food/avatar3.jpg",
    rating: 4,
    text:
      "We order for office lunches every week. Reliable, delicious, and always on time.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1, transition: { duration: 0.5 } },
};

const stars = (rating) =>
  Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={`size-4 ${
        i < rating
          ? "fill-amber-400 text-amber-400"
          : "fill-zinc-200 text-zinc-200"
      }`}
    />
  ));

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2
          className="font-serif text-4xl font-bold text-zinc-900 sm:text-5xl tracking-tight"
        >
          What Our Customers Say
        </h2>
        <p className="mt-4 text-lg text-zinc-500">
          Loved by foodies across the city.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            variants={itemVariants}
            className="rounded-3xl p-8 bg-white shadow-sm ring-1 ring-zinc-100"
          >
            <div className="flex items-center gap-3 mb-5">
              <Quote className="size-5 text-brand/40" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src={t.avatar}
                alt={t.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900">{t.name}</p>
                <p className="text-xs text-zinc-500">{t.role}</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">{stars(t.rating)}</div>
            <p className="text-zinc-500 leading-relaxed">
              {t.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
