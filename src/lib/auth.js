import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const client = new MongoClient(process.env.MONGODB_URL);
export const db = client.db("pizza-baba");

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
      // "free" | "premium" — never settable from the client (input omitted).
      subscription: {
        type: "string",
        required: false,
        defaultValue: "free",
      },
    },
  },

  // Server-side guard: only allow the three roles the app defines.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!["customer", "vendor", "admin"].includes(user.role)) {
            throw new Error("Invalid account role");
          }
          return user;
        },
      },
    },
  },

  socialProviders: { 
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID , 
      clientSecret: process.env.GITHUB_CLIENT_SECRET , 
    }, 
  },
});