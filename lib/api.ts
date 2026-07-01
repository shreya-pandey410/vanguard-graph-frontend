const BASE_URL = "http://localhost:3001/api/v1";

export async function getMerchants() {
  const res = await fetch(`${BASE_URL}/merchants`);
  const json = await res.json();
  return json.data;
}

export async function getMerchant(id: string) {
  const res = await fetch(`${BASE_URL}/merchants/${id}`);
  const json = await res.json();
  if (!json.success) return null;
  return json.data;
}

export async function createMerchant(body: {
  name: string;
  email: string;
  phone: string;
  deviceFingerprint: string;
  ipAddress: string;
  bankAccountNumber: string;
  bankAccountIfsc: string;
}) {
  const res = await fetch(`${BASE_URL}/merchants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

export async function getAlerts() {
  const res = await fetch(`${BASE_URL}/alerts`);
  const json = await res.json();
  return json.data;
}