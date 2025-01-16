import { NextApiRequest, NextApiResponse } from "next";
import { captureException } from "@sentry/nextjs";
import { today, tomorrow, week, weekend, twoWeeksDefault } from "@lib/dates";
import { getCalendarEvents } from "@lib/helpers";
import { getRegionFromQuery } from "@utils/helpers";
import { Event } from "@store";

interface EventsResponse {
  events: Event[];
  noEventsFound?: boolean;
}

interface ErrorResponse {
  error: unknown;
}

interface GetEventsParams {
  from: Date;
  until?: Date;
  q?: string;
  maxResults?: number;
  town?: string;
}

const noEventsFound = async (
  events: EventsResponse,
  query: string,
  town?: string
): Promise<EventsResponse> => {
  const { from, until } = twoWeeksDefault();
  const q = getRegionFromQuery(query);

  events = await getCalendarEvents({
    from,
    until,
    q,
    maxResults: 7,
    town,
  });
  events = { ...events, noEventsFound: true };

  return events;
};

const getEvents = async ({
  from,
  until,
  q,
  maxResults,
  town,
}: GetEventsParams): Promise<EventsResponse> => {
  let events: EventsResponse;
  try {
    events = await getCalendarEvents({
      from,
      until,
      q,
      maxResults,
      town,
    });
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching calendar events");
  }

  if (events.noEventsFound) {
    events = await noEventsFound(events, q as string, town);
  }

  return events;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<EventsResponse | ErrorResponse>
): Promise<void> => {
  const { page, q, maxResults: maxResultsQuery, town } = req.query;
  const maxResults = maxResultsQuery ? parseInt(maxResultsQuery as string, 10) : undefined;

  let events: EventsResponse = { events: [] };

  try {
    switch (page) {
      case "today": {
        const { from: fromToday, until: untilToday } = today();
        events = await getEvents({
          from: fromToday,
          until: untilToday,
          q: q as string,
          maxResults,
          town: town as string,
        });
        break;
      }
      case "tomorrow": {
        const { from: fromTomorrow, until: toTomorrow } = tomorrow();
        events = await getEvents({
          from: fromTomorrow,
          until: toTomorrow,
          q: q as string,
          maxResults,
          town: town as string,
        });
        break;
      }
      case "week": {
        const { from: fromWeek, until: toWeek } = week();
        events = await getEvents({
          from: fromWeek,
          until: toWeek,
          q: q as string,
          maxResults,
          town: town as string,
        });
        break;
      }
      case "weekend": {
        const { from: fromWeekend, until: toWeekend } = weekend();
        events = await getEvents({
          from: fromWeekend,
          until: toWeekend,
          q: q as string,
          maxResults,
          town: town as string,
        });
        break;
      }
      case "search": {
        const fromSearch = new Date();
        events = await getEvents({
          from: fromSearch,
          q: q as string,
          town: town as string,
        });
        break;
      }
      default: {
        const { from: fromDefault, until: untilDefault } = twoWeeksDefault();
        events = await getEvents({
          from: fromDefault,
          until: untilDefault,
          q: q as string,
          maxResults,
          town: town as string,
        });
      }
    }

    res.setHeader("Cache-Control", "public, max-age=900, must-revalidate");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    captureException(error);
    res.status(500).json({ error });
  }
};

export default handler;
