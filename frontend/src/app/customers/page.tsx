"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

export default function CustomersPage() {
  const { tenant } = useTenant();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    api
      .get(`/insights/${tenant.id}/top-customers`)
      .then((res) => setCustomers(res.data))
      .finally(() => setLoading(false));
  }, [tenant]);

  if (!tenant) return <p>Loading tenant...</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👥 Top Customers ({tenant.name})</h1>

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <table className="w-full border rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => (
              <tr
                key={c.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-3 border font-semibold">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : ""}{" "}
                  {c.name}
                </td>
                <td className="p-3 border">{c.email || "—"}</td>
                <td className="p-3 border text-green-600 font-bold">
                  ${c.totalSpend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
