import axios from "axios";
import { captureException, setExtra } from "@sentry/nextjs";
import { siteUrl } from "@config/index";

class HTTPError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "HTTPError";
    this.status = status;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

async function fetchWithScrapfly(url) {
  try {
    const response = await axios.get("https://api.scrapfly.io/scrape", {
      params: {
        key: process.env.NEXT_PUBLIC_SCRAPFLY,
        url: url,
        render_js: false,
        asp: false,
        country: "es",
      },
    });

    if (response.status !== 200) {
      throw new HTTPError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return response.data.result.content;
  } catch (error) {
    console.error("Error in fetchWithScrapfly:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  const { searchParams } = new URL(req.url, siteUrl);
  let itemUrl = searchParams.get("itemUrl");

  console.log("Received request for itemUrl:", itemUrl);

  try {
    itemUrl = decodeURIComponent(itemUrl);

    if (!itemUrl) {
      throw new ValidationError("Item URL is required");
    }

    const html = await fetchWithScrapfly(itemUrl);

    res.status(200).send(html);
  } catch (error) {
    console.error("Error in handler:", error);
    return handleError(error, itemUrl, res);
  }
}

function handleError(error, itemUrl, res) {
  setExtra("itemUrl", itemUrl);
  captureException(error);

  let status, message;

  console.error("Error details:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    itemUrl: itemUrl,
  });

  switch (true) {
    case error instanceof ValidationError:
      status = 400;
      message = error.message;
      break;
    case error instanceof HTTPError:
      status = error.status >= 500 ? 502 : 400;
      message =
        error.status >= 500
          ? "Server error fetching the item"
          : "Invalid item URL";
      break;
    case error.name === "AbortError":
      status = 504;
      message = "Request timed out";
      break;
    default:
      status = 500;
      message = "An unexpected error occurred";
  }

  console.error("Error response:", { status, message });

  res.status(status).json({ error: message });
}
