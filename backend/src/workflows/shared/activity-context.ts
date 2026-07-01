import { MerchantEvent, InvestigationResult, TimelineEvent } from "./workflow-events";

export interface ActivityContext {
  investigationId: string;
  merchantEvent: MerchantEvent;
  result: Partial<InvestigationResult>;
  timeline: TimelineEvent[];
}

export function createActivityContext(
  investigationId: string,
  event: MerchantEvent
): ActivityContext {
  return {
    investigationId,
    merchantEvent: event,
    result: { investigationId, merchantId: event.merchantId, graphLinks: [], timeline: [] },
    timeline: [],
  };
}

export function addTimelineEvent(ctx: ActivityContext, eventMsg: string, detail?: string) {
  const entry: TimelineEvent = {
    ts: new Date().toISOString(),
    event: eventMsg,
    detail,
  };
  ctx.timeline.push(entry);
  if (ctx.result.timeline) {
    ctx.result.timeline.push(entry);
  }
}
