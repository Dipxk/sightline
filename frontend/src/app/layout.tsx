import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sightline — Multimodal GTM Intelligence",
  description:
    "Turn any prospect website into a personalized multimodal agent proof-of-concept in 60 seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg antialiased">{children}</body>
    </html>
  );
}
