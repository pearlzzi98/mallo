import type { CalendarEvent, EventDraft } from "@mallo/domain";
import type { CalendarProvider } from "./calendar-provider.js";

const mockEvents: CalendarEvent[] = [
  {
    id: "evt_1",
    title: "Team sync",
    startAt: "2026-03-20T06:00:00.000Z",
    endAt: "2026-03-20T07:00:00.000Z",
    timezone: "Asia/Seoul",
    source: "manual",
    status: "confirmed"
  }
];

export class MockCalendarProvider implements CalendarProvider {
  async listEvents(_: { calendarId: string; from: string; to: string }) {
    return mockEvents;
  }

  async createEvent(input: { calendarId: string; draft: EventDraft }) {
    const event: CalendarEvent = {
      id: `evt_${Date.now()}`,
      title: input.draft.title,
      startAt: input.draft.startAt,
      endAt: input.draft.endAt,
      timezone: input.draft.timezone,
      notes: input.draft.notes,
      source: input.draft.source,
      status: "confirmed"
    };

    mockEvents.push(event);
    return event;
  }
}
