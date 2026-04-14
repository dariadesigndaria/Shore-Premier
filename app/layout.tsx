import type { Metadata } from "next";
import { Figtree, Poppins, Red_Hat_Display } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "EasyFund – Shore Premier Finance",
  description: "Yacht loan application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${figtree.variable} ${poppins.variable} ${redHatDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f9f9f9] font-figtree">{children}</body>
    </html>
  );
}
