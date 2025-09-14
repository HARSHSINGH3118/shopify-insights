"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        let tenantId: string | null = localStorage.getItem("tenantId");

        // If tenantId not stored, resolve it via tenant email (login)
        if (!tenantId) {
          const email = localStorage.getItem("email");
          if (!email) {
            alert("Please login again.");
            window.location.href = "/";
            return;
          }

          // fetch all tenants and match
          const tenantsRes = await api.get("/tenants");
          const tenant = tenantsRes.data.find(
            (t: any) => t.shopDomain === email || t.name === email
          );

          if (!tenant) {
            alert("Tenant not found, please sign up.");
            return;
          }

          tenantId = tenant.id as string;
          localStorage.setItem("tenantId", tenantId);
        }

        // ✅ only call API if tenantId is guaranteed to be string
        if (tenantId) {
          const res = await api.get(`/insights/${tenantId}/summary`);
          setSummary(res.data);
        }
      } catch (err) {
        console.error("❌ Failed to fetch dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        📊 Shopify Insights Dashboard
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : !summary ? (
        <p className="text-red-500">Failed to load data</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Customers</h2>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalCustomers}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalOrders}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Revenue</h2>
            <p className="text-2xl font-bold text-green-600">
              ${summary.totalRevenue}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
