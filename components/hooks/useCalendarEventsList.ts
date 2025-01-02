import useSWR, { preload } from "swr";
import { normalizeEvent } from "@utils/normalize";
import { Event } from "@store";

interface CalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
    date?: string;
  };
  location?: string;
}

interface CalendarResponse {
  items: CalendarEvent[];
}

interface UseCalendarEventsListProps {
  from: Date;
  until: Date;
}

const fetcher = async ([url]: [string]): Promise<Event[]> => {
  const res = await fetch(url);
  const json: CalendarResponse = await res.json();
  let normalizedItems: Event[] = [];

  try {
    normalizedItems = json.items.map((item) => normalizeEvent(item));
  } catch (e) {
    console.error("Error normalizing calendar events:", e);
  }

  return normalizedItems;
};

export const useCalendarEventsList = ({ from, until }: UseCalendarEventsListProps) => {
  const fromDate = from.toISOString();
  const untilDate = until.toISOString();
  const URL = `https://www.googleapis.com/calendar/v3/calendars/${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR}@group.calendar.google.com/events?timeMin=${fromDate}&timeMax=${untilDate}&singleEvents=true&orderBy=startTime&showDeleted=false&maxResults=100&${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID}`;

  preload(URL, fetcher);

  return useSWR<Event[]>(URL, fetcher, { suspense: true, keepPreviousData: true });
};
