// One-off seed: enforce a single admin account for the app.
//   admin email    : raad73575@gmail.com
//   admin password : 12345678
// Also demotes every other user with role "admin" to "customer".
// Run: node scripts/seed-admin.mjs
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env", import.meta.url), "utf8");
const uri = env.match(/^MONGODB_URL=(.*)$/m)?.[1]?.trim();
if (!uri) {
  console.error("MONGODB_URL not found in .env");
  process.exit(1);
}
process.env.MONGODB_URL = uri;
process.env.BETTER_AUTH_SECRET ??=
  env.match(/^BETTER_AUTH_SECRET=(.*)$/m)?.[1]?.trim();
process.env.BETTER_AUTH_URL ??=
  env.match(/^BETTER_AUTH_URL=(.*)$/m)?.[1]?.trim();

const ADMIN_EMAIL = "raad73575@gmail.com";
const ADMIN_PASSWORD = "12345678";
const ADMIN_NAME = "Raad Raad";

const { auth, db } = await import("../src/lib/auth.js");
const { hashPassword, verifyPassword } = await import("better-auth/crypto");

const users = db.collection("user");
const accounts = db.collection("account");
const sessions = db.collection("session");

const now = new Date().toISOString();

// ── 1. Ensure the admin user exists ──────────────────────────────────────────
let admin = await users.findOne({ email: ADMIN_EMAIL });
if (!admin) {
  console.log(`Creating admin user ${ADMIN_EMAIL} ...`);
  await auth.api.signUpEmail({
    body: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: ADMIN_NAME,
      role: "admin",
    },
  });
  admin = await users.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    console.error("Failed to create the admin user.");
    process.exit(1);
  }
} else {
  // Make sure an existing target user is (still) the admin, verified.
  await users.updateOne(
    { _id: admin._id },
    { $set: { role: "admin", emailVerified: true, updatedAt: now } }
  );
  console.log(`Admin user ${ADMIN_EMAIL} already exists — role/verified enforced.`);
}

const adminId = admin._id;

// ── 2. Reset the admin password to 12345678 ──────────────────────────────────
const passwordHash = await hashPassword(ADMIN_PASSWORD);
const cred = await accounts.findOne({
  userId: { $in: [adminId, String(adminId)] },
  providerId: "credential",
});
if (cred) {
  await accounts.updateOne(
    { _id: cred._id },
    { $set: { password: passwordHash, updatedAt: now } }
  );
  console.log("Admin password reset to 12345678.");
} else {
  await accounts.insertOne({
    accountId: String(adminId),
    providerId: "credential",
    userId: adminId,
    createdAt: now,
    updatedAt: now,
    password: passwordHash,
  });
  console.log("Created credential account for the admin.");
}

// ── 3. Demote every other admin ──────────────────────────────────────────────
const result = await users.updateMany(
  { role: "admin", email: { $not: /^raad73575@gmail\.com$/i } },
  { $set: { role: "customer", updatedAt: now } }
);
console.log(`Demoted ${result.modifiedCount} other admin account(s) to customer.`);

// ── 4. Verify the credentials actually work ──────────────────────────────────
try {
  const signIn = await auth.api.signInEmail({
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const ok = await verifyPassword({
    hash: passwordHash,
    password: ADMIN_PASSWORD,
  });
  console.log(
    `Sign-in check: ${signIn?.user ? "OK" : "FAILED"} (password hash verify: ${
      ok ? "OK" : "FAILED"
    })`
  );
  if (signIn?.token) {
    await sessions.deleteOne({ token: signIn.token });
  }
  if (!signIn?.user || !ok) {
    process.exit(1);
  }
} catch (err) {
  console.error("Sign-in verification failed:", err?.message || err);
  process.exit(1);
}

// ── 5. Final state ───────────────────────────────────────────────────────────
const admins = await users
  .find({ role: "admin" })
  .project({ email: 1, name: 1 })
  .toArray();
console.log(`\nAdmin accounts remaining: ${admins.length}`);
for (const a of admins) console.log(`  - ${a.email} (${a.name})`);

// auth.js keeps a MongoClient connection open — exit explicitly.
process.exit(admins.length === 1 && admins[0].email === ADMIN_EMAIL ? 0 : 1);
