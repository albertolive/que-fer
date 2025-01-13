import { getWeather } from "@lib/helpers";

const handler = async (req, res) => {
  try {
    const { location } = req.query;
    const weather = await getWeather(false, location);

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
    res.status(500).json({ error });
  }
};

export default handler;
