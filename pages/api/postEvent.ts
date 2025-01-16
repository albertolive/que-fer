import { NextApiRequest, NextApiResponse } from "next";
import { captureException } from "@sentry/nextjs";
import { postToGoogleCalendar } from "@lib/apiHelpers";

interface EventRequest {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUploaded: boolean;
  eventUrl?: string;
}

interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  guestsCanInviteOthers: boolean;
  guestsCanModify: boolean;
}

interface ErrorResponse {
  error: string;
}

/**
 * API Route Handler to Post Events to Google Calendar
 * 
 * Expects a POST request with JSON body containing:
 * - title: string
 * - description: string
 * - location: string
 * - startDate: string (ISO format)
 * - endDate: string (ISO format)
 * - imageUploaded: boolean
 * - eventUrl?: string
 * 
 * Returns:
 * - 200: Google Calendar event data
 * - 500: Error message
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any | ErrorResponse>
): Promise<void> {
  try {
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      imageUploaded,
      eventUrl,
    } = req.body as EventRequest;

    const enhancedDescription = eventUrl
      ? `${description}<span id="more-info" class="hidden" data-url="${eventUrl}"></span>`
      : description;

    const event: CalendarEvent = {
      summary: title,
      description: enhancedDescription,
      location,
      start: {
        dateTime: startDate,
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: endDate,
        timeZone: "Europe/Madrid",
      },
      guestsCanInviteOthers: imageUploaded,
      guestsCanModify: imageUploaded,
    };

    try {
      const { data } = await postToGoogleCalendar(event);
      console.log("Inserted new item successfully: " + title);
      res.status(200).json(data);
    } catch (error) {
      const errorMessage = `Error inserting item to calendar in postEvent API: ${
        error instanceof Error ? error.message : String(error)
      }`;
      console.error(errorMessage);
      captureException(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  } catch (error) {
    const errorMessage = `Error in postEvent API: ${
      error instanceof Error ? error.message : String(error)
    }`;
    console.error(errorMessage);
    captureException(new Error(errorMessage));
    res.status(500).json({ error: errorMessage });
  }
}
