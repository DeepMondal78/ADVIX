import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import SmoothScroll from "../components/SmoothScroll";
import Navbar from "../components/layout/Navbar";

const helvetica = localFont({
  src: "../fonts/helvetica-rounded-bold-5871d05ead8de.otf",
  weight: "700",
  style: "normal",
  variable: "--font-helvetica-rounded",
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["800", "900"],
});

export const metadata: Metadata = {
  title: "Advix Technology | Next-Gen Software & Web Agency",
  description:
    "Crafting high-performance web systems, custom applications, and digital experiences without corporate friction.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable}, ${helvetica.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#C1C9D6] text-[#00010A] font-[Arial,Helvetica,sans-serif]">
        <SmoothScroll />
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
