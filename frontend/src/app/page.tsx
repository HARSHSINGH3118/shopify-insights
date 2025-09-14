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
      <h1 className="text-2xl font-bold mb-6">📊 Summary ({tenant.name})</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Customers</p>
            <p className="text-2xl font-bold">{summary.totalCustomers}</p>
          </div>
          <span className="text-blue-500 text-3xl">👥</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Orders</p>
            <p className="text-2xl font-bold">{summary.totalOrders}</p>
          </div>
          <span className="text-green-500 text-3xl">🛒</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
          <div>
            <p className="text-gray-500">Revenue</p>
            <p className="text-2xl font-bold">
              ${Number(summary.totalRevenue).toLocaleString()}
            </p>
          </div>
          <span className="text-yellow-500 text-3xl">💰</span>
        </div>
      </div>
    </div>
  );
}
