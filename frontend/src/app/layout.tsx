import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Shopify Insights",
  description: "Multi-tenant Shopify Data Ingestion & Insights Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
