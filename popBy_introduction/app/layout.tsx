import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PopBy — Pop up when you pop by.",
  description: "A zero-anxiety, location-anchored social space for feeling human presence in the physical world.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
