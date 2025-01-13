import { NextApiRequest, NextApiResponse } from "next";
import { getWeather } from "@lib/helpers";
import type { WeatherMap } from "@lib/helpers";

interface ErrorResponse {
  error: string;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<WeatherMap | ErrorResponse>
): Promise<void> => {
  try {
    const { location } = req.query;
    const locationString = Array.isArray(location) ? location[0] : location;

    if (!locationString || typeof locationString !== 'string') {
      res.status(400).json({ error: 'Invalid location parameter' });
      return;
    }

    const weather = await getWeather(false, locationString);

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const cacheExpiry =
      Math.floor(
        (now.getTime() - startOfDay.getTime()) / (3 * 60 * 60 * 1000)
      ) *
        3 +
      3;
    const cacheSeconds = cacheExpiry * 60 * 60;

    res.setHeader(
      "Cache-Control",
      `public, max-age=${cacheSeconds}, must-revalidate`
    );
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(weather);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: String(error) });
  }
};

export default handler;
