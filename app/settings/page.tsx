"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highRiskThreshold, setHighRiskThreshold] = useState(60);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-1">Settings</h1>
      <p className="text-gray-500 mb-6">Configure how Vanguard Graph monitors and alerts on risk</p>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Alerts</p>
            <p className="text-sm text-gray-500">Get notified when a high-risk merchant is flagged</p>
          </div>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-5 h-5"
          />
        </div>

        <div>
          <p className="font-medium mb-1">High Risk Threshold</p>
          <p className="text-sm text-gray-500 mb-2">
            Merchants scoring above this number are marked High risk
          </p>
          <input
            type="range"
            min={0}
            max={100}
            value={highRiskThreshold}
            onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-sm text-gray-700 mt-1">Current: {highRiskThreshold}</p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save Settings
        </button>

        {saved && (
          <p className="text-green-600 text-sm font-medium">Settings saved.</p>
        )}
      </div>
    </main>
  );
}