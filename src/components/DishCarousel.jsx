"use client";

import { useEffect, useState } from "react";
import DishCard from "./card";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/items`;

const MAX_CARDS = 6;

const DishGrid = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch items from MongoDB
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch menu items.");
        }

        const data = await response.json();

        setDishes(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Fetch Dishes Error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[290px] animate-pulse rounded-3xl bg-zinc-200"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="py-12 text-center">
          <p className="text-sm font-medium text-red-500">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && dishes.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg font-semibold text-zinc-700">
            No dishes found.
          </p>
        </div>
      )}

      {/* Dish Cards */}
      {!loading && !error && dishes.length > 0 && (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.slice(0, MAX_CARDS).map((dish, i) => {
            const id = dish._id || dish.id;

            return (
              <DishCard
                key={id || i}
                name={dish.name || "Unnamed Pizza"}
                desc={dish.description || "Delicious freshly prepared pizza."}
                price={`৳${Number(dish.price || 0).toLocaleString()}`}
                img={dish.image || dish.images?.[0] || "/food/pizza.jpg"}
                category={dish.category}
                location={dish.location}
                vendor={dish.vendorName || dish.userName || "Pizza Baba"}
                href={`/Browse-Menu/${id}`}
                cta="View Details"
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DishGrid;