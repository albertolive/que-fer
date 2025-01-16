import { NextApiRequest, NextApiResponse } from "next";
import { getCalendarEvent } from "@lib/helpers";
import { Event } from "@store";

interface ErrorResponse {
  error: unknown;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Event | ErrorResponse>
): Promise<void> => {
  try {
    const eventId = req.query.eventId as string;
    const { event } = await getCalendarEvent(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.setHeader("Cache-Control", "public, max-age=900, must-revalidate");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;
