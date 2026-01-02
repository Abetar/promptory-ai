// lib/client-events.ts
type TrackPayload = {
  event: "prompt.copy";
  entityType?: string; // default "prompt"
  entityId?: string; // promptId
  meta?: Record<string, unknown>; // JSON serializable
};

export async function trackEvent(payload: TrackPayload) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // no-op: tracking nunca debe romper UX
  }
}
