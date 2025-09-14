"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

export default function SummaryPage() {
  const { tenant } = useTenant();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!tenant) return;
    api.get(`/insights/${tenant.id}/summary`).then((res) => setSummary(res.data));
  }, [tenant]);

  if (!tenant) return <p>Loading tenant...</p>;
  if (!summary) return <p>Loading data...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Summary ({tenant.name})</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded">Customers: {summary.totalCustomers}</div>
        <div className="bg-white shadow p-4 rounded">Orders: {summary.totalOrders}</div>
        <div className="bg-white shadow p-4 rounded">Revenue: ${summary.totalRevenue}</div>
      </div>
    </div>
  );
}
