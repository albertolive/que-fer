import axios, { AxiosResponse } from "axios";
import { captureException } from "@sentry/nextjs";
import { env, getFormattedDate, slug } from "@utils/helpers";
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

export async function postEvent(
  event: GoogleCalendarEvent,
  authToken?: string
): Promise<AxiosResponse> {
  try {
    const token = authToken;

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

export async function updateEvent(
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

interface Region {
  id: number;
  name: string;
  slug: string;
}

interface RegionsResponse {
  regions: Region[];
}

export async function getRegions(): Promise<{ [key: string]: Region }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions`, {
      next: {
        revalidate: 60 * 60, // 1 hour
      },
    });

    if (!response.ok) {
      const message = `API Error: ${response.status} ${response.statusText}`;
      console.error(message);
      captureException(new Error(message), {
        extra: {
          context: 'fetching regions',
          status: response.status,
          statusText: response.statusText
        }
      });
      throw new Error(message);
    }

    const data = (await response.json()) as RegionsResponse;

    const regionsMap: { [key: string]: Region } = {};
    data.regions.forEach((region) => {
      regionsMap[region.slug] = region;
    });

    return regionsMap;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error occurred while fetching regions: ${errorMessage}`);
    captureException(error, {
      extra: {
        context: 'fetching regions'
      }
    });
    return {};
  }
}
