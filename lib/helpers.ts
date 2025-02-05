import { captureException } from "@sentry/nextjs";
import { Event } from "../store";

interface CalendarEventsParams {
  from: Date;
  until?: Date;
  normalizeRss?: boolean;
  q?: string;
  maxResults?: number;
  filterByDate?: boolean;
  town?: string;
}

interface EventsResponse {
  events: Event[];
  noEventsFound: boolean;
  allEventsLoaded: boolean;
}

/**
 * Fetches calendar events with optional filtering and weather data
 */
export async function getCalendarEvents({
  from,
  until,
  normalizeRss = false,
  q = "",
  maxResults = 15,
  filterByDate = true,
  town,
}: CalendarEventsParams): Promise<EventsResponse> {
  try {
    const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;

    if (!calendarId || !apiKey) {
      throw new Error("Required environment variables are not defined");
    }

    const params = new URLSearchParams({
      key: apiKey,
      timeMin: from.toISOString(),
      singleEvents: "true",
      orderBy: "startTime" as "startTime",
      maxResults: maxResults.toString(),
      q,
    });

    if (until) {
      params.append("timeMax", until.toISOString());
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}@group.calendar.google.com/events?${params.toString()}`;

    const [res] = await Promise.all([fetch(url)]);

    if (!res.ok) {
      throw new Error(`Failed to fetch events: ${res.statusText}`);
    }

    const json = await res.json();
    if (!json.items) {
      return {
        events: [],
        noEventsFound: true,
        allEventsLoaded: true,
      };
    }

    return {
      events: json.items,
      noEventsFound: false,
      allEventsLoaded: json.items.length < maxResults,
    };
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    captureException(
      error instanceof Error
        ? error
        : new Error("Failed to fetch calendar events"),
      {
        extra: {
          context: "Calendar events fetch error",
          params: { from, until, q, maxResults, filterByDate, town },
          errorDetails: error instanceof Error ? error.message : String(error),
        },
      }
    );
    return {
      events: [],
      noEventsFound: true,
      allEventsLoaded: true,
    };
  }
}
