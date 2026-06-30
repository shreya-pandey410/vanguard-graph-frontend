"use client";
import { useState } from "react";
import Link from "next/link";

const mockAlerts = [
  {
    id: "ALT-001",
    merchantId: "M-218",
    merchantName: "QuickCart Traders",
    type: "Shared Device Fingerprint",
    severity: "High",
    time: "2 minutes ago",
    status: "Open",
  },
  {
    id: "ALT-002",
    merchantId: "M-218",
    merchantName: "QuickCart Traders",
    type: "Payout Account Reuse",
    severity: "High",
    time: "2 minutes ago",
    status: "Open",
  },
  {
    id: "ALT-003",
    merchantId: "M-219",
    merchantName: "Sunrise Mobile Wallet",
    type: "Unusual Payout Frequency",
    severity: "Medium",
    time: "1 hour ago",
    status: "Under Review",
  },
  {
    id: "ALT-004",
    merchantId: "M-220",
    merchantName: "Vertex Goods Co.",
    type: "New IP Address",
    severity: "Low",
    time: "3 hours ago",
    status: "Resolved",
  },
];

function severityColor(severity: string) {
  if (severity === "High") return "bg-red-100 text-red-700";
  if (severity === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function AlertsPage() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? mockAlerts : mockAlerts.filter((a) => a.severity === filter);

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
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

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left bg-gray-100 text-gray-600 text-sm">
              <th className="py-3 px-4">Alert</th>
              <th className="py-3 px-4">Merchant</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{a.type}</td>
                <td className="py-3 px-4">
                  <Link
                    href={`/investigations/${a.merchantId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {a.merchantName}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${severityColor(a.severity)}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{a.status}</td>
                <td className="py-3 px-4 text-gray-400 text-sm">{a.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}