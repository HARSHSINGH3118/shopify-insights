"use client";
import Sidebar from "@/components/Sidebar";
import { TenantProvider, useTenant } from "@/context/TenantContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import "./globals.css";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!tenant && pathname !== "/login") {
      router.push("/login");
    }
  }, [tenant, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        <TenantProvider>
          <AuthGuard>
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </AuthGuard>
        </TenantProvider>
      </body>
    </html>
  );
}
