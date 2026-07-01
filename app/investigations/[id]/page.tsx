"use client";
import { useState, useEffect } from "react";
import { use } from "react";
import Nav from "@/app/_components/nav";

function riskColor(level: string) {
  if (level === "high" || level === "High") return "text-red-600";
  if (level === "medium" || level === "Medium") return "text-yellow-600";
  return "text-green-600";
}

export default function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [merchant, setMerchant] = useState<any>(null);
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/v1/merchants/${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMerchant(json.data);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    fetch(`http://localhost:3001/api/v1/alerts?merchantId=${id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.length > 0) {
          setAlert(json.data[0]);
        }
      })
      .catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="p-8 text-gray-500">Loading investigation...</div>
    </div>
  );

  if (error || !merchant) return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="p-8 text-red-500">Merchant not found or backend is offline.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="p-8 space-y-6">
        <h1 className="text-2xl font-bold">{merchant.name} — {merchant.id}</h1>

        <div className="p-4 border rounded bg-white">
          <p className="font-semibold">
            Risk Score: <span className={riskColor(merchant.riskLevel)}>{merchant.riskScore} ({merchant.riskLevel})</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">Status: {merchant.status}</p>
        </div>

        {alert && (
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">AI Risk Memo</h2>
            <p>{alert.summary}</p>
          </div>
        )}

        <div className="p-4 border rounded bg-white">
          <h2 className="font-semibold mb-2">Linked Entities</h2>
          <p>Device Fingerprint: {merchant.deviceFingerprint ?? "None"}</p>
          <p>Bank Account: {merchant.bankAccountNumber ?? "None"}</p>
          <p>IFSC: {merchant.bankAccountIfsc ?? "None"}</p>
          <p>IP Address: {merchant.ipAddress ?? "None"}</p>
        </div>

        {(merchant.deviceFingerprint || merchant.bankAccountNumber) && (
          <div className="p-6 border rounded bg-white">
            <h2 className="font-semibold mb-4">Relationship Graph</h2>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="px-4 py-3 bg-red-100 border border-red-400 rounded text-center">
                {merchant.name}
                <div className="text-xs text-gray-500">{merchant.id}</div>
              </div>
              {merchant.deviceFingerprint && (
                <>
                  <div className="text-gray-400">──device──&gt;</div>
                  <div className="px-4 py-3 bg-yellow-100 border border-yellow-400 rounded text-center">
                    Device {merchant.deviceFingerprint}
                  </div>
                </>
              )}
              {merchant.bankAccountNumber && (
                <>
                  <div className="text-gray-400">──payout──&gt;</div>
                  <div className="px-4 py-3 bg-orange-100 border border-orange-400 rounded text-center">
                    Bank {merchant.bankAccountNumber}
                    <div className="text-xs text-gray-500">{merchant.bankAccountIfsc}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {action ? (
          <div className="p-4 border rounded bg-green-50 text-green-700 font-semibold">
            Status updated: {action}
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setAction("Blocked")}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Block
            </button>
            <button
              onClick={() => setAction("Sent to Review")}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Send to Review
            </button>
          </div>
        )}
      </main>
    </div>
  );
}