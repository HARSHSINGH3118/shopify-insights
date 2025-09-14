"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

export default function EventsPage() {
  const { tenant } = useTenant();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [type, setType] = useState("CART_UPDATED");
  const [payload, setPayload] = useState("{\"example\":\"data\"}");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    fetchEvents();
  }, [tenant]);

  const fetchEvents = () => {
    if (!tenant) return;
    setLoading(true);
    api
      .get(`/events/${tenant.id}`)
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    try {
      setSubmitting(true);
      await api.post(`/events/${tenant.id}`, {
        type,
        payload: JSON.parse(payload),
      });
      setPayload("{\"example\":\"data\"}");
      fetchEvents(); 
    } catch (err) {
      console.error("Event submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenant) return <p>Loading tenant...</p>;
  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Custom Events ({tenant.name})</h1>

      {/* Form to trigger event */}
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 shadow rounded">
        <div className="flex gap-4 items-center">
          <label className="font-medium">Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="CART_UPDATED">CART_UPDATED</option>
            <option value="CHECKOUT_CREATED">CHECKOUT_CREATED</option>
            <option value="CHECKOUT_UPDATED">CHECKOUT_UPDATED</option>
            <option value="ORDER_CANCELLED">ORDER_CANCELLED</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="font-medium">Payload (JSON):</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full border p-2 rounded font-mono text-sm"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Trigger Event"}
        </button>
      </form>

      {/* Events table */}
      {events.length === 0 ? (
        <p>No events found</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Occurred At</th>
              <th className="p-2 border">Payload</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="text-center">
                <td className="p-2 border">{e.type}</td>
                <td className="p-2 border">
                  {new Date(e.occurredAt).toLocaleString()}
                </td>
                <td className="p-2 border text-left">
                  <pre className="text-xs bg-gray-50 p-2 rounded max-w-xs overflow-x-auto">
                    {JSON.stringify(e.payload, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
