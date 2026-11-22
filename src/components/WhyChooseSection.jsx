"use client";

import { motion } from "framer-motion";
import { Shield, Truck, Leaf, Award, Clock2, Zap } from "lucide-react";

const BENEFITS = [
  {
    icon: Shield,
    title: "100% Fresh Ingredients",
    desc: "We source locally-grown produce and premium toppings for every pizza.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Hot, fresh, and on time — delivered straight to your doorstep.",
  },
  {
    icon: Leaf,
    title: "Vegetarian Friendly",
    desc: "Plenty of plant-based options for every dietary preference.",
  },
  {
    icon: Award,
    title: "Award-Winning Taste",
    desc: "Voted best pizza in the city by food critics and customers alike.",
  },
  {
    icon: Clock2,
    title: "Open 7 Days a Week",
    desc: "Craving pizza at midnight? We&rsquo;ve got you covered.",
  },
  {
    icon: Zap,
    title: "Easy Online Ordering",
    desc: "Order in a few taps and track your delivery in real time.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WhyChooseSection() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2
          className="font-serif text-4xl font-bold text-zinc-900 sm:text-5xl tracking-tight"
        >
          Why Choose PizzaHub?
        </h2>
        <p className="mt-4 text-lg text-zinc-500">
          More than just pizza — it&rsquo;s an experience you&rsquo;ll love.
        </p>
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              variants={itemVariants}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="rounded-3xl p-8 bg-white shadow-sm ring-1 ring-zinc-100 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-5">
                <Icon size={24} strokeWidth={2} />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-zinc-500 leading-relaxed">
                {benefit.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
