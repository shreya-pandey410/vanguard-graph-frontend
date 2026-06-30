import { mockMerchants } from "@/lib/mock-data";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Vanguard Graph — Risk Dashboard</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Merchant</th>
            <th>Risk Score</th>
            <th>Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockMerchants.map((m) => (
            <tr key={m.id} className="border-b hover:bg-gray-50">
              <td className="py-3">
                <Link href={`/investigations/${m.id}`} className="text-blue-600 underline">
                  {m.name}
                </Link>
              </td>
              <td>{m.riskScore}</td>
              <td>{m.riskLevel}</td>
              <td>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}