import useSWR, { preload } from "swr";
import { normalizeEvent } from "@utils/normalize";

const fetcher = async ([url]) => {
  const res = await fetch(url);
  const json = await res.json();
  let normalizedItems;

  try {
    normalizedItems = json.items.map((item) => normalizeEvent(item));
  } catch (e) {
    console.error(e);
  }

  return normalizedItems;
};

export const useCalendarEventsList = ({ from, until }) => {
  const fromDate = from.toISOString();
  const untilDate = until.toISOString();
  const URL = `https://www.googleapis.com/calendar/v3/calendars/${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR}@group.calendar.google.com/events?timeMin=${fromDate}&timeMax=${untilDate}&singleEvents=true&orderBy=startTime&showDeleted=false&maxResults=100&${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID}`;

  preload(URL, fetcher);

  return useSWR(URL, fetcher, { suspense: true, keepPreviousData: true });
};
