export type EventSource = "voice" | "text" | "manual";

export type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  notes?: string;
  source: EventSource;
  status: "confirmed" | "tentative";
};

export type EventDraft = {
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  notes?: string;
  source: EventSource;
};

export type AvailabilityPreference = {
  preferredWeekdays?: number[];
  preferredHours?: number[];
  blockedWeekdays?: number[];
  blockedHours?: number[];
};

export type SchedulingIntent = {
  rawText: string;
  title: string;
  preferredDate: string;
  preferredHour: number;
  durationMinutes: number;
  timezone: string;
};

export type ConflictResult = {
  hasConflict: boolean;
  conflicts: CalendarEvent[];
  reason?: string;
};

export type SlotSuggestion = {
  startAt: string;
  endAt: string;
  score: number;
  reason: string;
};

export type DraftReview = {
  draft: EventDraft;
  conflict: ConflictResult;
  suggestions: SlotSuggestion[];
};
