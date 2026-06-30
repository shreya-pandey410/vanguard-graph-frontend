
export const RISK_WEIGHTS = {
  velocityBreach: 25,      // bahut saari transactions short time mein
  amountAnomaly: 20,       // user ke normal se bahut zyada amount
  geoMismatch: 15,         // IP country != account country
  newDevice: 10,           // pehli baar dikha device
  sharedDevice: 15,        // device multiple accounts use kar rahe (ring signal)
  blacklistedIp: 15,       // known bad IP
} as const;

export type RiskSignal = keyof typeof RISK_WEIGHTS;


export const RISK_THRESHOLDS = {
  critical: 90,
  high: 70,
  medium: 40,
  // iske niche = low
} as const;


export const SIGNAL_LABELS: Record<RiskSignal, string> = {
  velocityBreach: 'High transaction velocity',
  amountAnomaly: 'Unusual transaction amount',
  geoMismatch: 'Geographic mismatch (IP vs account)',
  newDevice: 'First-time device',
  sharedDevice: 'Device shared across multiple accounts',
  blacklistedIp: 'Known malicious IP address',
};