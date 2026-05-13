/**
 * Root App Router layout.
 *
 * Responsibility: define document-level metadata and HTML/body wrappers shared by all routes.
 * Data flow: receives route segments as `children` and renders them inside the base document shell.
 * Lifecycle: runs once per route render as the top-level layout in the app tree.
 */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secco Lead Capture",
  description: "A minimal Next.js app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Keep the global document shell minimal; page-level components own app content and structure.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
