"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

type Tenant = {
  id: string;
  name: string;
  shopDomain: string;
};

type TenantContextType = {
  tenant: Tenant | null;
  setTenant: (t: Tenant) => void;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tenant");
    if (saved) {
      setTenant(JSON.parse(saved));
    } else {
      api.get("/tenants").then((res) => {
        if (res.data.length > 0) {
          setTenant(res.data[0]);
          localStorage.setItem("tenant", JSON.stringify(res.data[0]));
        }
      });
    }
  }, []);

  const updateTenant = (t: Tenant) => {
    setTenant(t);
    localStorage.setItem("tenant", JSON.stringify(t));
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant: updateTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
