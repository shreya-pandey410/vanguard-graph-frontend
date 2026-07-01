import { WorkflowLogger } from "../../workflows/shared/workflow-logger";

const logger = new WorkflowLogger("EmailPatternService");

export interface EmailAnalysis {
  email: string;
  domain: string;
  isDisposable: boolean;
  isFreemail: boolean;
  patternFlags: string[];
}

const DISPOSABLE_DOMAINS = ["mailinator.com", "tempmail.com", "guerrillamail.com", "throwam.com"];
const FREEMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];

export async function analyzeEmailPattern(email: string): Promise<EmailAnalysis> {
  logger.info("Analyzing email pattern", { email });
  await new Promise((r) => setTimeout(r, 50));

  const domain = email.split("@")[1]?.toLowerCase() || "";
  const isDisposable = DISPOSABLE_DOMAINS.includes(domain);
  const isFreemail = FREEMAIL_DOMAINS.includes(domain);

  const patternFlags: string[] = [];
  if (isDisposable) patternFlags.push("DISPOSABLE_EMAIL");

  // Check for sequential number pattern like merchant123@gmail.com
  if (/\d{3,}/.test(email.split("@")[0])) patternFlags.push("SEQUENTIAL_NUMBER_PATTERN");

  return { email, domain, isDisposable, isFreemail, patternFlags };
}
