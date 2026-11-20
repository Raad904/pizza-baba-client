// One-off seed script: sample menu items + orders for the vendor test account.
// Run: node scripts/seed-vendor.mjs
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const uri = env.match(/^MONGODB_URL=(.*)$/m)?.[1]?.trim();
if (!uri) {
  console.error("MONGODB_URL not found in .env");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const db = client.db("pizza-baba");

const vendor = await db.collection("user").findOne({ email: "vikram@example.com" });
if (!vendor) {
  console.error("vendor test user not found (vikram@example.com)");
  process.exit(1);
}
const vendorId = vendor._id;
const now = new Date().toISOString();
const iso = (days) => new Date(Date.now() + days * 86400000).toISOString();

const items = [
  {
    _id: randomUUID(), vendorId, name: "Margherita Pizza", category: "Pizza",
    description: "Classic tomato, mozzarella and fresh basil on a thin crust.",
    price: 12.5, location: "Gulshan, Dhaka", imageUrl: "/food/hero-pasta.jpg",
    imageDeleteUrl: null, status: "Approved", available: true,
    createdAt: iso(-10), updatedAt: iso(-8),
  },
  {
    _id: randomUUID(), vendorId, name: "Pappardelle with Vegetable", category: "Pasta",
    description: "Wide ribbons tossed with roasted seasonal vegetables.",
    price: 14.0, location: "Banani, Dhaka", imageUrl: "/food/pappardelle.jpg",
    imageDeleteUrl: null, status: "Approved", available: true,
    createdAt: iso(-9), updatedAt: iso(-7),
  },
  {
    _id: randomUUID(), vendorId, name: "Ravioli Stuffed", category: "Pasta",
    description: "Cheese stuffed ravioli with creamy pesto sauce.",
    price: 13.5, location: "Dhanmondi, Dhaka", imageUrl: "/food/ravioli.jpg",
    imageDeleteUrl: null, status: "Pending", available: true,
    createdAt: iso(-1), updatedAt: iso(-1),
  },
  {
    _id: randomUUID(), vendorId, name: "Mystery Special", category: "Other",
    description: "A dish that did not pass admin review.",
    price: 9.99, location: "Uttara, Dhaka", imageUrl: "/food/fusilli.jpg",
    imageDeleteUrl: null, status: "Rejected", available: false,
    createdAt: iso(-5), updatedAt: iso(-3),
  },
];

await db.collection("menuItems").deleteMany({ vendorId });
await db.collection("menuItems").insertMany(items);

const orders = [
  {
    _id: randomUUID(), vendorId, itemId: items[0]._id, itemName: items[0].name,
    itemImage: items[0].imageUrl, itemPrice: items[0].price,
    customerId: "seed-customer-1", customerName: "Rahim Uddin",
    customerEmail: "rahim@example.com",
    deliveryDate: "2026-11-25", deliveryAddress: "House 12, Road 5, Gulshan, Dhaka",
    customerMessage: "Please make it extra spicy.",
    status: "pending", createdAt: iso(-1),
  },
  {
    _id: randomUUID(), vendorId, itemId: items[1]._id, itemName: items[1].name,
    itemImage: items[1].imageUrl, itemPrice: items[1].price,
    customerId: "seed-customer-2", customerName: "Fatema Akter",
    customerEmail: "fatema@example.com",
    deliveryDate: "2026-11-26", deliveryAddress: "Flat B4, Banani C/A, Dhaka",
    customerMessage: "Call before delivery please.",
    status: "pending", createdAt: iso(0),
  },
  {
    _id: randomUUID(), vendorId, itemId: items[0]._id, itemName: items[0].name,
    itemImage: items[0].imageUrl, itemPrice: items[0].price,
    customerId: "seed-customer-3", customerName: "Karim Hossain",
    customerEmail: "karim@example.com",
    deliveryDate: "2026-11-22", deliveryAddress: "Road 11, Dhanmondi, Dhaka",
    customerMessage: "", status: "accepted", createdAt: iso(-3), resolvedAt: iso(-2),
  },
  {
    _id: randomUUID(), vendorId, itemId: items[1]._id, itemName: items[1].name,
    itemImage: items[1].imageUrl, itemPrice: items[1].price,
    customerId: "seed-customer-4", customerName: "Jashim Uddin",
    customerEmail: "jashim@example.com",
    deliveryDate: "2026-11-20", deliveryAddress: "Uttara Sector 7, Dhaka",
    customerMessage: "Deliver at midnight.", status: "rejected",
    createdAt: iso(-4), resolvedAt: iso(-3),
  },
];

await db.collection("orders").deleteMany({ vendorId });
await db.collection("orders").insertMany(orders);

console.log(`Seeded ${items.length} menu items and ${orders.length} orders for vendor ${vendorId}`);
await client.close();
