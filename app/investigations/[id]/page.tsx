import { mockMerchants, mockMemo } from "@/lib/mock-data";

export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const merchant = mockMerchants.find((m) => m.id === id);

  if (!merchant) return <div className="p-8">Merchant not found.</div>;

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">{merchant.name} — {merchant.id}</h1>
      <div className="p-4 border rounded">
        <p className="font-semibold">Risk Score: {merchant.riskScore} ({merchant.riskLevel})</p>
      </div>

      <div className="p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">AI Risk Memo</h2>
        <p>{mockMemo[merchant.id] ?? "No suspicious connections found."}</p>
      </div>

      <div className="p-4 border rounded">
        <h2 className="font-semibold mb-2">Linked Entities</h2>
        <p>Shared Device: {merchant.sharedDevice ?? "None"}</p>
        <p>Shared Bank Account: {merchant.sharedBankAccount ?? "None"}</p>
      </div>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-red-600 text-white rounded">Block</button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded">Send to Review</button>
      </div>
    </main>
  );
}