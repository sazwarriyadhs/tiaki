import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TIAKI Commander",
    template: "%s | TIAKI Commander",
  },
  description:
    "TIAKI Commander — Halal Slaughter Intelligence and Operations Command Center.",
  applicationName: "TIAKI Commander",
  authors: [{ name: "TIAKI" }],
  creator: "TIAKI",
  publisher: "TIAKI",
  keywords: [
    "TIAKI",
    "Halal Slaughter Intelligence",
    "Halal Operations",
    "Halal Compliance",
    "Traceability",
    "Food Safety",
    "New Zealand",
  ],
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
    apple: "/images/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "TIAKI Commander",
    description:
      "TIAKI Commander — Halal Slaughter Intelligence and Operations Command Center.",
    siteName: "TIAKI Commander",
    locale: "en_NZ",
  },
  twitter: {
    card: "summary",
    title: "TIAKI Commander",
    description:
      "TIAKI Commander — Halal Slaughter Intelligence and Operations Command Center.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#07553A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
