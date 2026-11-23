"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, UtensilsCrossed, RefreshCw } from "lucide-react";
import DishCard from "@/components/card";
import { authClient } from "@/lib/auth-client";
import { isApprovedItem } from "@/lib/utils";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/items`;

export default function BrowseMenuPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const currentUser = session?.user;

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [location, setLocation] = useState("all");

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(API_URL);
                console.log(response);


                if (!response.ok) {
                    throw new Error("Could not load menu items.");
                }

                const data = await response.json();
                setItems(Array.isArray(data) ? data : data.items || []);
            } catch (err) {
                console.error("Browse Menu Error:", err);
                setError(err.message || "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    // Only admin-approved items are visible to customers.
    const approvedItems = useMemo(
        () => items.filter((item) => isApprovedItem(item)),
        [items]
    );

    const categories = useMemo(
        () => [...new Set(approvedItems.map((item) => item.category).filter(Boolean))],
        [approvedItems]
    );

    const locations = useMemo(
        () => [...new Set(approvedItems.map((item) => item.location).filter(Boolean))],
        [approvedItems]
    );

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return approvedItems.filter((item) => {
            const matchesSearch =
                !query || (item.name || "").toLowerCase().includes(query);

            const matchesCategory =
                category === "all" || item.category === category;

            const matchesLocation =
                location === "all" || item.location === location;

            return matchesSearch && matchesCategory && matchesLocation;
        });
    }, [approvedItems, search, category, location]);

    const handleViewDetails = (itemId) => {
        if (!currentUser) {
            router.push(
                `/Login?callbackURL=${encodeURIComponent(`/Browse-Menu/${itemId}`)}`
            );
            return;
        }

        router.push(`/Browse-Menu/${itemId}`);
    };

    const getVendorName = (item) =>
        item.vendorName ||
        item.userName ||
        item.vendor?.name ||
        item.user?.name ||
        "Pizza Baba";

    const getImage = (item) =>
        item.image || item.images?.[0] || "/images/pizza-placeholder.png";

    return (
        <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
                        Fresh & Delicious
                    </p>

                    <h1 className="mt-3 text-3xl font-bold text-zinc-900 sm:text-4xl">
                        Browse Our Menu
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-500 sm:text-base">
                        Explore delicious pizzas from our vendors and find your favorite.
                    </p>
                </div>

                {/* Search and filters */}
                <div className="mt-10 grid gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 md:grid-cols-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search pizza by name..."
                            className="w-full rounded-xl border border-zinc-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((itemCategory) => (
                            <option key={itemCategory} value={itemCategory}>
                                {itemCategory}
                            </option>
                        ))}
                    </select>

                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    >
                        <option value="all">All Locations</option>
                        {locations.map((itemLocation) => (
                            <option key={itemLocation} value={itemLocation}>
                                {itemLocation}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">
                        Available Pizzas
                    </h2>
                    <p className="text-sm text-zinc-500">
                        {loading ? "Loading..." : `${filteredItems.length} items found`}
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[372px] animate-pulse rounded-[40px] bg-zinc-200"
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="mt-8 rounded-2xl bg-red-50 p-8 text-center">
                        <p className="font-semibold text-red-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white"
                        >
                            <RefreshCw size={15} />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredItems.length === 0 && (
                    <div className="mt-8 rounded-2xl bg-white px-5 py-16 text-center shadow-sm ring-1 ring-zinc-100">
                        <UtensilsCrossed className="mx-auto size-12 text-zinc-300" />
                        <h3 className="mt-4 text-lg font-bold text-zinc-800">
                            No pizzas found
                        </h3>
                        <p className="mt-2 text-sm text-zinc-500">
                            Try another search or change your filters.
                        </p>
                        <button
                            onClick={() => {
                                setSearch("");
                                setCategory("all");
                                setLocation("all");
                            }}
                            className="mt-5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Menu cards */}
                {!loading && !error && filteredItems.length > 0 && (
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredItems.map((item) => {
                            const id = item._id || item.id;

                            return (
                                <DishCard
                                    key={id}
                                    name={item.name || "Unnamed Pizza"}
                                    desc={item.description || "Delicious freshly prepared pizza."}
                                    price={`৳${Number(item.price || 0).toLocaleString()}`}
                                    img={getImage(item)}
                                    category={item.category}
                                    location={item.location}
                                    vendor={getVendorName(item)}
                                    href={`/Browse-Menu/${id}`}
                                    cta="View Details"
                                    onCtaClick={() => handleViewDetails(id)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}