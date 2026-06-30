export type Merchant = {
  id: string;
  name: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  status: "Ingesting" | "Linking" | "Scoring" | "Done";
  sharedDevice?: string;
  sharedBankAccount?: string;
};

export const mockMerchants: Merchant[] = [
  {
    id: "M-218",
    name: "QuickCart Traders",
    riskScore: 87,
    riskLevel: "High",
    status: "Done",
    sharedDevice: "D-773",
    sharedBankAccount: "B-442",
  },
  {
    id: "M-219",
    name: "Sunrise Mobile Wallet",
    riskScore: 42,
    riskLevel: "Medium",
    status: "Done",
  },
  {
    id: "M-220",
    name: "Vertex Goods Co.",
    riskScore: 12,
    riskLevel: "Low",
    status: "Done",
  },
];

export const mockMemo: Record<string, string> = {
  "M-218":
    "Merchant M-218 shares device fingerprint D-773 with 4 previously onboarded merchants. Two of those merchants route payouts to Bank Account B-442, which is already linked to one flagged fraud case. This creates a high-confidence coordination signal.",
};