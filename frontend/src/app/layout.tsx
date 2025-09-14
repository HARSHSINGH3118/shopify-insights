import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { TenantProvider } from "../context/TenantContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <TenantProvider>
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </TenantProvider>
      </body>
    </html>
  );
}
