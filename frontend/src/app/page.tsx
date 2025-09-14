"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Boxes,
  UserPlus,
  Star,
} from "lucide-react";

export default function SummaryPage() {
  const { tenant } = useTenant();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!tenant) return;
    api.get(`/insights/${tenant.id}/summary`).then((res) => setSummary(res.data));
  }, [tenant]);

  if (!tenant) return <p>Loading tenant...</p>;
  if (!summary) return <p>Loading data...</p>;

  const cards = [
    {
      label: "Customers",
      value: summary.totalCustomers,
      icon: Users,
    },
    {
      label: "Orders",
      value: summary.totalOrders,
      icon: ShoppingCart,
    },
    {
      label: "Revenue",
      value: `$${Number(summary.totalRevenue).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Products",
      value: summary.totalProducts,
      icon: Package,
    },
    {
      label: "Inventory",
      value: summary.totalInventory,
      icon: Boxes,
    },
    {
      label: "New Customers (7d)",
      value: summary.newCustomersThisWeek,
      icon: UserPlus,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Summary <span className="text-gray-500">({tenant.name})</span>
      </h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white/70 backdrop-blur-sm shadow-md rounded-xl p-6 flex justify-between items-center hover:shadow-lg hover:scale-[1.02] transition"
          >
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <Icon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Product */}
      {summary.topProduct && (
        <div className="bg-white/70 backdrop-blur-sm shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <Star className="h-5 w-5 text-gray-600" />
            Top Product
          </h2>
          <p className="text-gray-900 font-medium">{summary.topProduct.title}</p>
          <p className="text-sm text-gray-500">
            Revenue: ${Number(summary.topProduct.revenue).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
