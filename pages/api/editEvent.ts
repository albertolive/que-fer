import { NextApiRequest, NextApiResponse } from "next";
import { captureException } from "@sentry/nextjs";
import { updateEvent } from "@lib/apiHelpers";

interface EventRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUploaded: boolean;
  eventUrl?: string;
}

interface GoogleCalendarEvent {
  id: string;
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
  isProduction: boolean;
  calendarId: string;
}

interface ApiResponse {
  message?: string;
  data?: any;
  error?: string;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
): Promise<void> => {
  try {
    if (req.method !== "PUT") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const {
      id,
      title,
      description,
      location,
      startDate,
      endDate,
      imageUploaded,
      eventUrl,
    }: EventRequest = req.body;

    const cleanedDescription = description.replace(
      /<span id="more-info" class="hidden" data-url="[^"]*"><\/span>/gi,
      ""
    );

    const enhancedDescription = eventUrl
      ? `${cleanedDescription}<span id="more-info" class="hidden" data-url="${eventUrl}"></span>`
      : cleanedDescription;

    const event: GoogleCalendarEvent = {
      id,
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
      isProduction: process.env.NODE_ENV === "production",
      calendarId: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR as string,
    };

    try {
      const { data } = await updateEvent(event);
      return res.status(200).json({ data });
    } catch (error) {
      console.error("Error updating Google Calendar event:", error);
      captureException(error);
      return res.status(500).json({
        error: "Error updating Google Calendar event",
      });
    }
  } catch (error) {
    console.error("Error in handler:", error);
    captureException(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

export default handler;
