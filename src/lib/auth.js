import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL);
export const db = client.db("pizza-baba");

// The app allows exactly one admin account — this email.
export const ADMIN_EMAIL = "raad73575@gmail.com";

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
  },


  user: {
    additionalFields: {
      role: {
        type: "string",
        input: true,
        required: true,
        defaultValue: "customer",
      },

      status: {
        type: "string",
        defaultValue: "unblock",
        input: false,
      },
      // "free" | "premium" — never settable from the client (input omitted).
      subscription: {
        type: "string",
        required: false,
        defaultValue: "free",
      },
    },
  },

  // Server-side guard: only allow the three roles the app defines, and
  // enforce that the app has exactly one admin account (see scripts/seed-admin.mjs).
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!["customer", "vendor", "admin"].includes(user.role)) {
            throw new Error("Invalid account role");
          }
          // Only the designated email may ever be created as an admin.
          if (
            user.role === "admin" &&
            String(user.email || "").toLowerCase() !== ADMIN_EMAIL
          ) {
            throw new Error("Only one admin account is allowed");
          }
          return user;
        },
      },
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});