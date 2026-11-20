import Link from "next/link";

import AuthSection, { PromoCard } from "@/components/AuthSection";

export const metadata = {
  title: "Sign Up — Foody",
};

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-cream">
 

      <section className="mx-auto grid max-w-5xl items-stretch gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 md:py-16">
        <AuthSection
          mode="signup"
          title="Sign Up"
          fields={[
            { name: "name", placeholder: "Full Name", autoComplete: "name" },
            { name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
            { name: "password", type: "password", placeholder: "Password", autoComplete: "new-password" },
            { name: "image", type: "photo", label: "…or upload from device" },
            {
              name: "role",
              type: "select",
              defaultValue: "customer",
              options: [
                { value: "customer", label: "Customer" },
                { value: "vendor", label: "Vendor" },
                { value: "admin", label: "Admin" },
              ],
            },
          ]}
          footer={
            <>
              Already have an account?{" "}
              <Link href="/SignIn" className="font-semibold underline underline-offset-2">
                Sign In
              </Link>
            </>
          }
        />

        <PromoCard />
      </section>
    </main>
  );
}
