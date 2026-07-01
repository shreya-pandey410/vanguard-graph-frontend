"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function riskColor(level: string) {
  if (level === "high" || level === "High") return "bg-red-100 text-red-700";
  if (level === "medium" || level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function DashboardPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/v1/merchants")
      .then((res) => res.json())
      .then((json) => {
        setMerchants(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black text-white px-6 py-4 flex gap-6">
        <Link href="/" className="font-bold">Vanguard Graph</Link>
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <Link href="/merchants/new" className="hover:underline">New Merchant</Link>
        <Link href="/alerts" className="hover:underline">Alerts</Link>
        <Link href="/settings" className="hover:underline">Settings</Link>
      </nav>

      <main className="p-8">
        <h1 className="text-2xl font-bold mb-1">Risk Dashboard</h1>
        <p className="text-gray-500 mb-6">Live fraud investigation results across onboarded merchants</p>

        {loading && <p className="text-gray-500">Loading merchants...</p>}

        {error && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 p-4 rounded">
            Backend is not running. Start the backend server on port 4000 to see live data.
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left bg-gray-100 text-gray-600 text-sm">
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m: any) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/investigations/${m.id}`} className="text-blue-600 font-medium hover:underline">
                        {m.name}
                      </Link>
                      <div className="text-xs text-gray-400">{m.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold">{m.riskScore}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${riskColor(m.riskLevel)}`}>
                        {m.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{m.status}</td>
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