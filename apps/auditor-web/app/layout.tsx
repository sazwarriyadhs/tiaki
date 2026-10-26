import "./globals.css";
import { AuditorShell } from "@/components/layout/AuditorShell";

export const metadata = {
  title: "TIAKI Auditor",
  description: "TIAKI Audit and Assurance Workspace"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuditorShell>{children}</AuditorShell>
      </body>
    </html>
  );
}
