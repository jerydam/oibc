import type { Metadata } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/public-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ona-Igbala Baptist Church | Sanctuary of Praise",
  description: "Making ready a people prepared for the coming of the Lord.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
