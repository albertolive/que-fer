import axios, { AxiosResponse } from "axios";
import { captureException } from "@sentry/nextjs";
import { env, getFormattedDate, slug } from "@utils/helpers";
import { getAuthToken } from "@lib/auth";
import { siteUrl } from "@config/index";

interface GoogleCalendarEvent {
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  summary: string;
  description?: string;
  location?: string;
  id?: string;
  [key: string]: any; // For any additional fields that might be present
}

interface IndexEventParams {
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  summary: string;
  id: string;
}

export async function postToGoogleCalendar(
  event: GoogleCalendarEvent,
  authToken?: string
): Promise<AxiosResponse> {
  try {
    const token = authToken || (await getAuthToken());

    const response = await axios.post<GoogleCalendarEvent>(
      `https://www.googleapis.com/calendar/v3/calendars/${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR}@group.calendar.google.com/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (env === "prod" && response.data.id) {
      try {
        await indexEvent({
          start: response.data.start,
          end: response.data.end,
          summary: response.data.summary,
          id: response.data.id
        });
      } catch (err) {
        console.error(`Error occurred while indexing event: ${err instanceof Error ? err.message : String(err)}`);
        captureException(err, {
          extra: {
            context: 'indexing event after Google Calendar post'
          }
        });
      }
    }

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error occurred while posting to Google Calendar: ${errorMessage}`);
    captureException(error, {
      extra: {
        context: 'posting to Google Calendar'
      }
    });
    throw new Error(`Error posting to Google Calendar: ${errorMessage}`);
  }
}

export async function updateGoogleCalendarEvent(
  event: GoogleCalendarEvent
): Promise<AxiosResponse> {
  try {
    const editEventUrl = process.env.NEXT_PUBLIC_EDIT_EVENT;
    if (!editEventUrl) {
      throw new Error("NEXT_PUBLIC_EDIT_EVENT environment variable is not defined");
    }
    const response = await axios.put<GoogleCalendarEvent>(
      editEventUrl,
      event,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (env === "prod") {
      try {
        // await indexEvent(event);
      } catch (err) {
        console.error(`Error occurred while indexing event: ${err instanceof Error ? err.message : String(err)}`);
        captureException(err, {
          extra: {
            context: 'indexing event after Google Calendar update'
          }
        });
      }
    }

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error occurred while updating Google Calendar: ${errorMessage}`);
    captureException(error, {
      extra: {
        context: 'updating Google Calendar'
      }
    });
    throw new Error(`Error updating Google Calendar: ${errorMessage}`);
  }
}

export async function indexEvent({ start, end, summary, id }: IndexEventParams): Promise<void> {
  try {
    // Get the originalFormattedStart value
    const { formattedStart: originalFormattedStart } = getFormattedDate(start, end);

    // Construct the URL using the slug function
    const eventUrl = `${siteUrl}/e/${slug(
      summary,
      originalFormattedStart,
      id
    )}`;

    // Call the new function to index the event to Google Search
    await axios.post(`${siteUrl}/api/indexEvent`, { url: eventUrl });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Error occurred while indexing event ${id}: ${errorMessage}`);
    captureException(err, {
      extra: {
        context: 'indexing event',
        eventId: id
      }
    });
    throw new Error(`Error occurred while indexing event ${id}: ${errorMessage}`);
  }
}
