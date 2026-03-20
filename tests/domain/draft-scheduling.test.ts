import { afterEach, describe, expect, it, vi } from "vitest";
import type { CalendarEvent, EventDraft } from "../../packages/domain/src/models";
import {
  buildDraftFromIntent,
  detectConflict,
  parseDemoVoiceInput,
  reviewDraft,
  suggestAlternatives
} from "../../packages/domain/src/scheduler";

function createDraft(overrides: Partial<EventDraft> = {}): EventDraft {
  return {
    title: "Design review",
    startAt: "2026-03-21T06:00:00.000Z",
    endAt: "2026-03-21T07:00:00.000Z",
    timezone: "Asia/Seoul",
    source: "voice",
    ...overrides
  };
}

function createEvent(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: "evt_1",
    title: "Existing event",
    startAt: "2026-03-21T06:30:00.000Z",
    endAt: "2026-03-21T07:30:00.000Z",
    timezone: "Asia/Seoul",
    source: "manual",
    status: "confirmed",
    ...overrides
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("scheduler domain logic", () => {
  it("builds a draft from a scheduling intent", () => {
    const draft = buildDraftFromIntent({
      rawText: "Schedule design review",
      title: "Design review",
      preferredDate: "2026-03-21T00:00:00.000Z",
      preferredHour: 15,
      durationMinutes: 90,
      timezone: "Asia/Seoul"
    });

    expect(draft).toEqual({
      title: "Design review",
      startAt: "2026-03-21T06:00:00.000Z",
      endAt: "2026-03-21T07:30:00.000Z",
      timezone: "Asia/Seoul",
      source: "voice"
    });
  });

  it("detects overlaps but allows back-to-back events", () => {
    const overlapping = detectConflict(createDraft(), [createEvent()]);
    const backToBack = detectConflict(createDraft(), [
      createEvent({
        id: "evt_2",
        startAt: "2026-03-21T07:00:00.000Z",
        endAt: "2026-03-21T08:00:00.000Z"
      })
    ]);

    expect(overlapping.hasConflict).toBe(true);
    expect(overlapping.conflicts).toHaveLength(1);
    expect(backToBack).toEqual({
      hasConflict: false,
      conflicts: [],
      reason: undefined
    });
  });

  it("suggests nearby available slots and skips blocked ones", () => {
    const suggestions = suggestAlternatives(
      createDraft(),
      [
        createEvent(),
        createEvent({
          id: "evt_2",
          startAt: "2026-03-21T05:00:00.000Z",
          endAt: "2026-03-21T06:00:00.000Z"
        })
      ],
      {
        blockedHours: [8],
        preferredHours: [7]
      }
    );

    expect(suggestions).toHaveLength(3);
    expect(suggestions.map((suggestion) => suggestion.startAt)).toEqual([
      "2026-03-21T04:00:00.000Z",
      "2026-03-21T08:00:00.000Z",
      "2026-03-22T06:00:00.000Z"
    ]);
    expect(suggestions.some((suggestion) => suggestion.startAt === "2026-03-22T07:00:00.000Z")).toBe(false);
  });

  it("returns no alternatives when there is no conflict", () => {
    const review = reviewDraft(createDraft(), []);

    expect(review.conflict.hasConflict).toBe(false);
    expect(review.suggestions).toEqual([]);
  });

  it("parses demo voice input deterministically with a frozen clock", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T01:23:45.000Z"));

    expect(parseDemoVoiceInput("  Project sync  ", "Asia/Seoul")).toEqual({
      rawText: "  Project sync  ",
      title: "Project sync",
      preferredDate: "2026-03-21T01:23:45.000Z",
      preferredHour: 15,
      durationMinutes: 60,
      timezone: "Asia/Seoul"
    });
  });

  it("uses a default title when the input text is blank", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-20T01:23:45.000Z"));

    expect(parseDemoVoiceInput("   ", "Asia/Seoul").title).toBe("New event");
  });
});
