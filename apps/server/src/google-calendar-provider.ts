import { google } from "googleapis";
import type { CalendarEvent, EventDraft } from "@mallo/domain";
import type { OAuth2Client } from "google-auth-library";
import type { CalendarProvider } from "./calendar-provider.js";

function toCalendarEvent(item: {
  id?: string | null;
  summary?: string | null;
  description?: string | null;
  start?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
  end?: { dateTime?: string | null; date?: string | null; timeZone?: string | null } | null;
}): CalendarEvent {
  return {
    id: item.id ?? `evt_${Date.now()}`,
    title: item.summary ?? "Untitled event",
    startAt: item.start?.dateTime ?? item.start?.date ?? new Date().toISOString(),
    endAt: item.end?.dateTime ?? item.end?.date ?? new Date().toISOString(),
    timezone: item.start?.timeZone ?? item.end?.timeZone ?? "UTC",
    notes: item.description ?? undefined,
    source: "manual",
    status: "confirmed"
  };
}

export class GoogleCalendarProvider implements CalendarProvider {
  private readonly calendar;

  constructor(private readonly auth: OAuth2Client) {
    this.calendar = google.calendar({ version: "v3", auth });
  }

  async listEvents(input: { calendarId: string; from: string; to: string }) {
    const response = await this.calendar.events.list({
      calendarId: input.calendarId,
      timeMin: input.from,
      timeMax: input.to,
      singleEvents: true,
      orderBy: "startTime"
    });

    return (response.data.items ?? []).map(toCalendarEvent);
  }

  async createEvent(input: { calendarId: string; draft: EventDraft }) {
    const response = await this.calendar.events.insert({
      calendarId: input.calendarId,
      requestBody: {
        summary: input.draft.title,
        description: input.draft.notes,
        start: {
          dateTime: input.draft.startAt,
          timeZone: input.draft.timezone
        },
        end: {
          dateTime: input.draft.endAt,
          timeZone: input.draft.timezone
        }
      }
    });

    return toCalendarEvent(response.data);
  }
}
