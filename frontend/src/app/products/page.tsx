"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

export default function ProductsPage() {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;

    api
      .get(`/insights/${tenant.id}/top-products`)
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [tenant]);

  if (!tenant) return <p>Loading tenant...</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Top Products ({tenant.name})</h1>

      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Revenue</th>
              <th className="p-2 border">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="text-center">
                <td className="p-2 border">{p.title}</td>
                <td className="p-2 border">{p.description || "—"}</td>
                <td className="p-2 border">${p.totalRevenue}</td>
                <td className="p-2 border">{p.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
