import {
  AvailabilityPreference,
  CalendarEvent,
  ConflictResult,
  DraftReview,
  EventDraft,
  SchedulingIntent,
  SlotSuggestion
} from "./models";

const MINUTES_PER_HOUR = 60;
const SEARCH_DAYS = 7;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function sameHour(a: Date, b: Date) {
  return a.getHours() === b.getHours();
}

function isBlocked(date: Date, preferences?: AvailabilityPreference) {
  if (!preferences) {
    return false;
  }

  if (preferences.blockedWeekdays?.includes(date.getDay())) {
    return true;
  }

  return preferences.blockedHours?.includes(date.getHours()) ?? false;
}

export function buildDraftFromIntent(intent: SchedulingIntent): EventDraft {
  const start = new Date(intent.preferredDate);
  start.setHours(intent.preferredHour, 0, 0, 0);

  return {
    title: intent.title,
    startAt: start.toISOString(),
    endAt: addMinutes(start, intent.durationMinutes).toISOString(),
    timezone: intent.timezone,
    source: "voice"
  };
}

export function detectConflict(draft: EventDraft, events: CalendarEvent[]): ConflictResult {
  const draftStart = new Date(draft.startAt).getTime();
  const draftEnd = new Date(draft.endAt).getTime();
  const conflicts = events.filter((event) => {
    const eventStart = new Date(event.startAt).getTime();
    const eventEnd = new Date(event.endAt).getTime();
    return draftStart < eventEnd && draftEnd > eventStart;
  });

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    reason: conflicts.length > 0 ? "Requested slot overlaps with an existing calendar event." : undefined
  };
}

function scoreSuggestion(
  requestedStart: Date,
  candidateStart: Date,
  preferences?: AvailabilityPreference
) {
  let score = 100;

  if (requestedStart.getDay() !== candidateStart.getDay()) {
    score -= 15;
  }

  if (!sameHour(requestedStart, candidateStart)) {
    score -= 10;
  }

  const dayDistance = Math.abs(requestedStart.getTime() - candidateStart.getTime()) / (24 * 60 * 60 * 1000);
  score -= dayDistance * 5;

  if (preferences?.preferredWeekdays?.includes(candidateStart.getDay())) {
    score += 10;
  }

  if (preferences?.preferredHours?.includes(candidateStart.getHours())) {
    score += 15;
  }

  if (candidateStart.getHours() < 9 || candidateStart.getHours() > 20) {
    score -= 20;
  }

  return score;
}

function collides(candidateStart: Date, candidateEnd: Date, events: CalendarEvent[]) {
  return events.some((event) => {
    const eventStart = new Date(event.startAt).getTime();
    const eventEnd = new Date(event.endAt).getTime();
    return candidateStart.getTime() < eventEnd && candidateEnd.getTime() > eventStart;
  });
}

export function suggestAlternatives(
  draft: EventDraft,
  events: CalendarEvent[],
  preferences?: AvailabilityPreference,
  maxSuggestions = 3
): SlotSuggestion[] {
  const requestedStart = new Date(draft.startAt);
  const durationMinutes =
    (new Date(draft.endAt).getTime() - new Date(draft.startAt).getTime()) / 60_000;
  const suggestions: SlotSuggestion[] = [];

  for (let offsetDay = 0; offsetDay <= SEARCH_DAYS; offsetDay += 1) {
    for (const hourDelta of [0, -1, 1, -2, 2]) {
      const candidateStart = new Date(requestedStart);
      candidateStart.setDate(requestedStart.getDate() + offsetDay);
      candidateStart.setHours(requestedStart.getHours() + hourDelta, 0, 0, 0);

      const candidateEnd = addMinutes(candidateStart, durationMinutes);

      if (isBlocked(candidateStart, preferences)) {
        continue;
      }

      if (collides(candidateStart, candidateEnd, events)) {
        continue;
      }

      suggestions.push({
        startAt: candidateStart.toISOString(),
        endAt: candidateEnd.toISOString(),
        score: scoreSuggestion(requestedStart, candidateStart, preferences),
        reason:
          offsetDay === 0
            ? "Same day, nearby time is available."
            : "Same week alternative with no conflicts."
      });
    }
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .filter((suggestion, index, arr) => {
      return arr.findIndex((item) => item.startAt === suggestion.startAt) === index;
    })
    .slice(0, maxSuggestions);
}

export function reviewDraft(
  draft: EventDraft,
  events: CalendarEvent[],
  preferences?: AvailabilityPreference
): DraftReview {
  const conflict = detectConflict(draft, events);
  return {
    draft,
    conflict,
    suggestions: conflict.hasConflict ? suggestAlternatives(draft, events, preferences) : []
  };
}

export function parseDemoVoiceInput(rawText: string, timezone: string): SchedulingIntent {
  const normalized = rawText.trim();
  const now = new Date();
  const preferredDate = new Date(now);
  preferredDate.setDate(now.getDate() + 1);

  return {
    rawText,
    title: normalized || "New event",
    preferredDate: preferredDate.toISOString(),
    preferredHour: 15,
    durationMinutes: MINUTES_PER_HOUR,
    timezone
  };
}
