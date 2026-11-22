"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Pizza,
  Leaf,
  Drumstick,
  Star,
  Utensils,
  Coffee,
  Search,
} from "lucide-react";

import DishCard from "./card";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/items`;
const MAX_CARDS = 6;

const FALLBACK_IMAGES = [
  "/food/hero-pasta.jpg",
  "/food/pappardelle.jpg",
  "/food/ravioli.jpg",
  "/food/fusilli.jpg",
  "/food/pesto-pasta.jpg",
];

const CATEGORY_DETAILS = {
  classic: {
    icon: Pizza,
    desc: "Timeless favorites baked to perfection.",
  },
  vegetarian: {
    icon: Leaf,
    desc: "Fresh garden toppings on a crisp crust.",
  },
  meat: {
    icon: Drumstick,
    desc: "Hearty meat toppings for the carnivore in you.",
  },
  specialty: {
    icon: Star,
    desc: "Chef's special creations with bold flavors.",
  },
  sides: {
    icon: Utensils,
    desc: "Perfect starters to complement your meal.",
  },
  beverages: {
    icon: Coffee,
    desc: "Sweet endings and refreshing drinks.",
  },
};

const getCategoryId = (category) =>
  String(category || "Other")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getCategoryDetails = (category) => {
  const id = getCategoryId(category);

  if (id.includes("vegetarian") || id.includes("veggie")) {
    return CATEGORY_DETAILS.vegetarian;
  }

  if (id.includes("meat") || id.includes("chicken")) {
    return CATEGORY_DETAILS.meat;
  }

  if (id.includes("special") || id.includes("gourmet")) {
    return CATEGORY_DETAILS.specialty;
  }

  if (id.includes("side") || id.includes("appetizer")) {
    return CATEGORY_DETAILS.sides;
  }

  if (
    id.includes("beverage") ||
    id.includes("dessert") ||
    id.includes("drink")
  ) {
    return CATEGORY_DETAILS.beverages;
  }

  return CATEGORY_DETAILS.classic;
};

export default function CategorySection() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Fetch items from MongoDB
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch menu items.");
        }

        const data = await response.json();

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.items)
            ? data.items
            : [];

        setDishes(items);
      } catch (err) {
        console.error("Fetch Categories Error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // Create unique categories from MongoDB items
  const categories = dishes.reduce((result, dish) => {
    const categoryName = String(dish.category || "Other").trim();

    if (!categoryName) return result;

    const categoryId = getCategoryId(categoryName);

    const alreadyExists = result.some(
      (category) => category.id === categoryId
    );

    if (alreadyExists) return result;

    const categoryItems = dishes.filter(
      (item) =>
        getCategoryId(item.category || "Other") === categoryId
    );

    const firstItem = categoryItems[0];
    const details = getCategoryDetails(categoryName);

    result.push({
      id: categoryId,
      name: categoryName,
      icon: details.icon,
      desc: firstItem?.description || details.desc,
      image:
        firstItem?.image ||
        firstItem?.images?.[0] ||
        FALLBACK_IMAGES[result.length % FALLBACK_IMAGES.length],
      item: firstItem,
    });

    return result;
  }, []);

  // Filter categories by search query
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  // Show maximum 6 category cards
  const limitedCategories = filteredCategories.slice(0, MAX_CARDS);

  return (
    <section id="categories" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          Explore by Category
        </h2>
        <p className="mt-4 text-lg text-zinc-500">
          Discover delicious dishes crafted just for you.
        </p>
      </motion.div>

      {/* Category Search */}
      <div className="relative max-w-md mx-auto mb-16">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
        <input
          type="search"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-zinc-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}
      </div>

      {search && filteredCategories.length === 0 && !loading && !error && (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-zinc-700">
            No categories matching &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-4 rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark transition"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Loading State */}
      {!search && loading && (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[290px] animate-pulse rounded-3xl bg-zinc-200"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!search && !loading && error && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-red-500">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!search && !loading && !error && filteredCategories.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-zinc-700">
            No categories found.
          </p>
        </div>
      )}

      {/* Category Cards Using DishCard */}
      {!search && !loading && !error && filteredCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {limitedCategories.map((category) => {
            const item = category.item;
            const itemId = item?._id || item?.id;

            return (
              <motion.div
                key={category.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <DishCard
                  id={itemId}
                  name={category.name}
                  desc={category.desc}
                  price={
                    item?.price !== undefined
                      ? `৳${Number(item.price).toLocaleString()}`
                      : "Explore Menu"
                  }
                  img={category.image}
                  category={category.name}
                  location={item?.location}
                  vendor={
                    item?.vendorName ||
                    item?.userName ||
                    "Pizza Baba"
                  }
                  href={`/Browse-Menu?category=${encodeURIComponent(
                    category.name
                  )}`}
                  cta="Explore Category"
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
