import Link from "next/link";

import AuthSection, { PromoCard } from "@/components/AuthSection";

export const metadata = {
  title: "Sign In — Foody",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-cream">
   

      <section className="mx-auto grid max-w-5xl items-stretch gap-10 px-5 py-12 sm:px-8 md:grid-cols-2 md:py-16">
        <AuthSection
          mode="signin"
          title="Sign In"
          fields={[
            { name: "email", type: "email", placeholder: "Email", autoComplete: "email" },
            { name: "password", type: "password", placeholder: "Password", autoComplete: "current-password" },
          ]}
          footer={
            <>
              Don&apos;t have an account?{" "}
              <Link href="/SignUp" className="font-semibold underline underline-offset-2">
                Sign Up
              </Link>
            </>
          }
        />

        <PromoCard />
      </section>
    </main>
  );
}
