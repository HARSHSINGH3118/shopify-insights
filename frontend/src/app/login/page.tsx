"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");

    localStorage.setItem("tenantId", email);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Centered Card */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden flex">
        {/* Left side - Login form */}
        <div className="w-1/2 p-10 flex flex-col justify-center border-r border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Sign in to Shopify Insights
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Right side - Info section */}
        <div className="w-1/2 p-10 flex flex-col justify-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🚀 Welcome to Shopify Insights
          </h2>
          <p className="text-gray-600 mb-6">
            Monitor your store’s performance with clean, real-time insights.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li>✔ Track customers, orders, and revenue</li>
            <li>✔ Analyze product performance</li>
            <li>✔ Identify top customers by spend</li>
            <li>✔ Visualize trends with charts & filters</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
