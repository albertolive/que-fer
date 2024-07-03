import { captureException, setExtra } from "@sentry/nextjs";
import { XMLParser } from "fast-xml-parser";

export const config = {
  runtime: "edge",
};

const parser = new XMLParser();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
const HEADERS_JSON = { "Content-Type": "application/json" };

class HTTPError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "HTTPError";
    this.status = status;
  }
}

class ParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "ParseError";
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

async function fetchWithTimeout(url, options, timeout = 25000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const rssFeed = searchParams.get("rssFeed");

  try {
    if (!rssFeed) {
      throw new ValidationError("RSS feed URL is required");
    }

    const response = await fetchWithTimeout(rssFeed, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new HTTPError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    let data;

    if (
      response.headers["content-type"] &&
      response.headers["content-type"].includes("application/json")
    ) {
      // If the Content-Type is JSON, parse the response data as JSON
      data = JSON.parse(response.data);
    } else {
      // If the Content-Type is not JSON, decode the response data
      let decoder = new TextDecoder("utf-8");
      data = decoder.decode(response.data);

      // If the decoded data contains unusual characters, try ISO-8859-1
      if (data.includes("�")) {
        decoder = new TextDecoder("iso-8859-1");
        data = decoder.decode(response.data);
      }
    }

    let items = [];

    if (!Array.isArray(data)) {
      const json = parser.parse(data);

      // Validate the data
      if (
        !json ||
        !json.rss ||
        !json.rss.channel ||
        !Array.isArray(json.rss.channel.item)
      ) {
        console.log("Invalid RSS data format or no items in feed");
        return [];
      }

      data = json.rss.channel.item;
    }

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ message: "No items found in the feed", items: [] }),
        {
          status: 200,
          headers: HEADERS_JSON,
        }
      );
    }

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: HEADERS_JSON,
    });
  } catch (error) {
    return handleError(error, rssFeed);
  }
}

function handleError(error, rssFeed) {
  setExtra("rssFeed", rssFeed);
  captureException(error);

  let status, message;

  switch (true) {
    case error instanceof ValidationError:
      status = 400;
      message = `Invalid input: ${error.message}. Please provide a valid RSS feed URL.`;
      break;
    case error instanceof HTTPError:
      if (error.status >= 500) {
        status = 502;
        message = `RSS feed server error (HTTP ${error.status}): The server is not responding correctly. Please try again later.`;
      } else {
        status = 400;
        message = `RSS feed access error (HTTP ${error.status}): The feed URL is invalid or inaccessible. Please check the URL and your internet connection.`;
      }
      break;
    case error instanceof ParseError:
      status = 422;
      message = `RSS feed parsing error: ${error.message}. The feed may be malformed or in an unsupported format.`;
      break;
    case error.name === "AbortError":
      status = 504;
      message =
        "Request timeout: The RSS feed took too long to respond. The feed might be slow or temporarily unavailable.";
      break;
    default:
      status = 500;
      message = `Unexpected error: ${error.message}. Please try again or contact support if the issue persists.`;
  }

  console.error(`Error handling RSS feed (${rssFeed}):`, {
    status,
    message,
    errorName: error.name,
    errorMessage: error.message,
    stack: error.stack,
  });

  return new Response(JSON.stringify({ error: message, items: [] }), {
    status,
    headers: HEADERS_JSON,
  });
}
