"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/app/_components/nav";

function severityColor(severity: string) {
  if (severity === "high" || severity === "High") return "bg-red-100 text-red-700";
  if (severity === "medium" || severity === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/v1/alerts")
      .then((res) => res.json())
      .then((json) => {
        setAlerts(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtered =
    filter === "All"
      ? alerts
      : alerts.filter((a) => a.riskLevel?.toLowerCase() === filter.toLowerCase());

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-1">Alerts</h1>
        <p className="text-gray-500 mb-6">Triggered risk signals across all merchants</p>

        <div className="flex gap-2 mb-4">
          {["All", "High", "Medium", "Low"].map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded text-sm font-medium border ${
                filter === level ? "bg-black text-white" : "bg-white text-gray-600"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500">Loading alerts...</p>}

        {error && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 p-4 rounded">
            Backend is not running. Start the backend server on port 4000 to see live data.
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-gray-100 text-gray-600 text-sm">
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a: any) => (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{a.summary}</td>
                    <td className="py-3 px-4">
                      <Link href={`/investigations/${a.merchantId}`} className="text-blue-600 hover:underline">
                        {a.merchant?.name ?? a.merchantId}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColor(a.riskLevel)}`}>
                        {a.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{a.status}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(a.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}