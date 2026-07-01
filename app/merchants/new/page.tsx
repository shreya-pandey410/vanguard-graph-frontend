"use client";
import { useState } from "react";
import Nav from "@/app/_components/nav";

export default function NewMerchantPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    deviceFingerprint: "",
    ipAddress: "",
    bankAccountNumber: "",
    bankAccountIfsc: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/v1/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (json.success) {
        setSubmitted(true);
      } else {
        setError(json.error?.message ?? "Something went wrong.");
      }
    } catch {
      setError("Backend is offline. Please start the server on port 4000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="p-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-1">Onboard New Merchant</h1>
        <p className="text-gray-500 mb-6">Submit merchant details to start a fraud investigation</p>

        {submitted ? (
          <div className="p-4 bg-green-50 border border-green-300 text-green-700 rounded">
            Merchant submitted successfully. Investigation started.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Merchant Name", name: "name", placeholder: "Rajesh Kumar Traders" },
              { label: "Email", name: "email", placeholder: "rajesh@example.com" },
              { label: "Phone (10 digits)", name: "phone", placeholder: "9876543210" },
              { label: "Device Fingerprint", name: "deviceFingerprint", placeholder: "D-773" },
              { label: "IP Address", name: "ipAddress", placeholder: "192.168.1.10" },
              { label: "Bank Account Number", name: "bankAccountNumber", placeholder: "123456789012" },
              { label: "Bank IFSC Code", name: "bankAccountIfsc", placeholder: "HDFC0001234" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="border p-2 w-full rounded text-sm"
                  required
                />
              </div>
            ))}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Merchant"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}