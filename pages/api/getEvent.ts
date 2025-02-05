import { NextApiRequest, NextApiResponse } from "next";
import { getEvent } from "@lib/apiHelpers";
import { EventDetailResponseDTO } from "types/api/event";

interface ErrorResponse {
  error: unknown;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<EventDetailResponseDTO | ErrorResponse>
): Promise<void> => {
  try {
    const eventId = req.query.eventId as string;
    const response = await getEvent(eventId);

    if (!response.data) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.setHeader("Cache-Control", "public, max-age=900, must-revalidate");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;
