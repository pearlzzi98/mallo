import { CalendarEvent, EventDraft } from "@mallo/domain";

export interface CalendarProvider {
  listEvents(input: { calendarId: string; from: string; to: string }): Promise<CalendarEvent[]>;
  createEvent(input: { calendarId: string; draft: EventDraft }): Promise<CalendarEvent>;
}
