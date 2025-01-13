import createHash from "@utils/createHash";

const axios = require("axios");
const { DateTime } = require("luxon");

const DATE_FORMAT = "dd/MM/yyyy";
const TIME_ZONE = "Europe/Madrid";

async function fetchData() {
  const options = {
    method: "get",
    url: `https://api.browse.ai/v2/robots/${process.env.NEXT_PUBLIC_BROWSE_ROBOT_ID}/tasks`,
    params: { page: "1", sort: "-finishedAt" },
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_BROWSE_BEARER}`,
    },
  };

  try {
    const response = await axios(options);
    return response.data.result.robotTasks.items[0].capturedLists[
      "Agenda barcelona"
    ];
  } catch (error) {
    console.error(`Error fetching data from BrowseAi:`, error);
    throw error;
  }
}

function convertDateToRSS(date) {
  let rssDate;

  if (date.includes("Des de")) {
    // For date range
    const dates = date.match(/\d{2}\/\d{2}\/\d{4}/g);
    const dtStart = DateTime.fromFormat(dates[0], DATE_FORMAT, {
      zone: TIME_ZONE,
    });
    const dtEnd = DateTime.fromFormat(dates[1], DATE_FORMAT, {
      zone: TIME_ZONE,
    });
    const rssDateStart = dtStart.toRFC2822();
    const rssDateEnd = dtEnd.toRFC2822();
    rssDate = {
      from: rssDateStart,
      to: rssDateEnd,
    };
  } else {
    // For single date
    const dt = DateTime.fromFormat(date, DATE_FORMAT, { zone: TIME_ZONE });
    rssDate = {
      from: dt.toRFC2822(),
      to: null,
    };
  }

  return rssDate;
}

function normalizeData(events) {
  return events
    .map(
      ({ title, description, url, location = "Barcelona", date, imageUrl }) => {
        if (!title) return null;

        const formattedDate = convertDateToRSS(date);
        const hash = createHash(title, url, location, date);

        return {
          guid: hash,
          title,
          description,
          link: url,
          date: formattedDate,
          image: imageUrl,
          location,
        };
      }
    )
    .filter(Boolean);
}

async function scrapeEvents() {
  try {
    const events = await fetchData();
    return normalizeData(events);
  } catch (error) {
    console.error("Error in scrapeEvents function:", error);
    throw new Error("Failed to scrape events");
  }
}

export default async function handler(_, res) {
  try {
    const rssXml = await scrapeEvents();
    res.setHeader("Cache-Control", "public, max-age=86400, must-revalidate");
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(rssXml);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to handle request: ${error.message}` });
  }
}
