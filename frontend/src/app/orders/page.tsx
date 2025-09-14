"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

export default function OrdersPage() {
  const { tenant } = useTenant();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    api
      .get(`/insights/${tenant.id}/orders-by-date`)
      .then((res) => {
        const formatted = Object.entries(res.data).map(([date, value]) => ({
          date,
          revenue: Number(value),
        }));
        setOrders(formatted);
      })
      .finally(() => setLoading(false));
  }, [tenant]);

  if (!tenant) return <p>Loading tenant...</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📈 Orders by Date ({tenant.name})</h1>

      {orders.length === 0 ? (
        <p>No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={orders}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
