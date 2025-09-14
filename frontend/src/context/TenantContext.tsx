"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Tenant = {
  id: string;
  name: string;
  shopDomain: string;
};

type TenantContextType = {
  tenant: Tenant | null;
  setTenant: (t: Tenant) => void;
  logout: () => void;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Load tenant from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tenant");
    if (saved) {
      setTenant(JSON.parse(saved));
    }
  }, []);

  const updateTenant = (t: Tenant) => {
    setTenant(t);
    localStorage.setItem("tenant", JSON.stringify(t));
  };

  const logout = () => {
    setTenant(null);
    localStorage.removeItem("tenant");
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant: updateTenant, logout }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
