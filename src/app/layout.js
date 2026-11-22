import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import NavberPage from "@/components/Navber";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "Foody — It's not just Food",
  description: "It's not just Food, It's an Experience. Order fresh, delicious meals online.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavberPage></NavberPage>
        <main>
        {children}
        </main>
        <Footer />
        </body>
    </html>
  );
}
