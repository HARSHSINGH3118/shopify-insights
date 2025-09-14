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
        <table className="w-full border border-black rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300">Title</th>
              <th className="p-3 border border-gray-300">Description</th>
              <th className="p-3 border border-gray-300">Revenue</th>
              <th className="p-3 border border-gray-300">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-3 border border-gray-300 font-semibold">
                  {p.title}
                </td>
                <td className="p-3 border border-gray-300">
                  {p.description ? (
                    <div dangerouslySetInnerHTML={{ __html: p.description }} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 border border-gray-300">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    ${p.totalRevenue}
                  </span>
                </td>
                <td className="p-3 border border-gray-300">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {p.totalQuantity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
