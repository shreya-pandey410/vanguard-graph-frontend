import { mockMerchants } from "@/lib/mock-data";
import Link from "next/link";

function riskColor(level: string) {
  if (level === "High") return "bg-red-100 text-red-700";
  if (level === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function DashboardPage() {
  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">Risk Dashboard</h1>
      <p className="text-gray-500 mb-6">Live fraud investigation results across onboarded merchants</p>

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
            {mockMerchants.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link href={`/investigations/${m.id}`} className="text-blue-600 font-medium hover:underline">
                    {m.name}
                  </Link>
                  <div className="text-xs text-gray-400">{m.id}</div>
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
    </main>
  );
}