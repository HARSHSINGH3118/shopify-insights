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
      <h1 className="text-2xl font-bold mb-4">Top Customers ({tenant.name})</h1>

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Total Spend</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="text-center">
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.email || "—"}</td>
                <td className="p-2 border">${c.totalSpend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
