import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TIAKI Public Verification",
    template: "%s | TIAKI Verification"
  },
  description:
    "Public verification of TIAKI halal certification and traceability status.",
  applicationName: "TIAKI Public Verification",
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: "/logo.png"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#07553A"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
