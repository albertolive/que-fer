/* DO NOT REMOVE - PIPEDREAM */

import { NextRequest } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { captureException, setExtra } from "@sentry/nextjs";

export const config = {
  runtime: "edge",
};

interface FeedItem {
  title?: string;
  description?: string;
  link?: string | { https?: string; [key: string]: string | undefined };
  pubDate?: string;
  [key: string]: any;
}

interface FeedData {
  rss?: {
    channel: {
      item: FeedItem | FeedItem[];
    };
  };
  feed?: {
    entry: FeedItem | FeedItem[];
  };
}

const parser = new XMLParser();

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";
const HEADERS_JSON = { "Content-Type": "application/json" };

class HTTPError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HTTPError";
    this.status = status;
  }
}

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = 25000
): Promise<Response> {
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

function sanitizeUrl(url: string | URL): string {
  if (typeof url !== "string" && !(url instanceof URL)) {
    console.warn("Invalid URL type:", typeof url);
    return "";
  }
  const urlString = typeof url === 'string' ? url : url.toString();

  // Remove any leading "https," or "http,"
  let sanitized = urlString.replace(/^(https?),\s*/, "");

  // Ensure the URL starts with http:// or https://
  if (!sanitized.startsWith("http://") && !sanitized.startsWith("https://")) {
    sanitized = "https://" + sanitized;
  }

  // Remove any double slashes (except after the protocol)
  sanitized = sanitized.replace(/(https?:\/\/)\/+/g, "$1");

  // Remove any spaces in the URL
  sanitized = sanitized.replace(/\s+/g, "");

  try {
    // Try to construct a URL object to validate the URL
    new URL(sanitized);
    return sanitized;
  } catch (error) {
    console.warn("Invalid URL after sanitization:", sanitized);
    return "";
  }
}

function sanitizeItem(item: FeedItem): FeedItem {
  let link: string | undefined;
  if (typeof item.link === "object") {
    link = item.link.https || (Object.values(item.link)[0] as string | undefined);
  } else {
    link = item.link;
  }
  return {
    ...item,
    link: link ? sanitizeUrl(link) : "",
  };
}

function handleError(
  error: ValidationError | HTTPError | ParseError | Error | unknown,
  rssFeed: string | null
): Response {
  setExtra("rssFeed", rssFeed);
  captureException(error);

  let status: number;
  let message: string;

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
    case error instanceof Error && error.name === "AbortError":
      status = 504;
      message =
        "Request timeout: The RSS feed took too long to respond. The feed might be slow or temporarily unavailable.";
      break;
    default:
      status = 500;
      message = `Unexpected error: ${error instanceof Error ? error.message : String(error)}. Please try again or contact support if the issue persists.`;
  }

  console.error(`Error handling RSS feed (${rssFeed}):`, {
    status,
    message,
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  return new Response(JSON.stringify({ error: message, items: [] }), {
    status,
    headers: HEADERS_JSON,
  });
}

export default async function handler(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const rssFeed = searchParams.get("rssFeed");

  try {
    if (!rssFeed) {
      throw new ValidationError("RSS feed URL is required");
    }

    console.log("Fetching RSS feed:", rssFeed);

    const response = await fetchWithTimeout(rssFeed, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new HTTPError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const contentType = response.headers.get("content-type");
    let data: string | FeedData | FeedItem[];

    if (contentType?.includes("application/json")) {
      data = await response.json();
      console.log(
        "Received JSON data:",
        JSON.stringify(data).slice(0, 200) + "..."
      );
    } else {
      const arrayBuffer = await response.arrayBuffer();
      let html = new TextDecoder("utf-8").decode(arrayBuffer);

      // Fallback to ISO-8859-1 if we detect the replacement character
      if (html.includes("�")) {
        html = new TextDecoder("iso-8859-1").decode(arrayBuffer);
      }

      console.log("Received XML data:", html.slice(0, 200) + "...");
      data = html;
    }

    let items: FeedItem[] = [];

    if (Array.isArray(data)) {
      items = data;
    } else if (typeof data === "object" && data !== null) {
      const arrayProperty = Object.values(data).find(Array.isArray);
      if (arrayProperty) {
        items = arrayProperty;
      } else {
        items = [data as FeedItem];
      }
    } else if (typeof data === "string") {
      try {
        const json = parser.parse(data) as FeedData;
        console.log("Parsed XML:", JSON.stringify(json).slice(0, 200) + "...");

        if (json?.rss?.channel) {
          items = Array.isArray(json.rss.channel.item)
            ? json.rss.channel.item
            : [json.rss.channel.item].filter(Boolean);
        } else if (json?.feed?.entry) {
          items = Array.isArray(json.feed.entry)
            ? json.feed.entry
            : [json.feed.entry].filter(Boolean);
        } else {
          console.log(
            "Unexpected feed structure:",
            JSON.stringify(json).slice(0, 200) + "..."
          );
          throw new ParseError("Unexpected feed structure");
        }
      } catch (parseError) {
        console.error("Error parsing feed:", parseError);
        throw new ParseError(
          `Failed to parse feed: ${
            parseError instanceof Error ? parseError.message : String(parseError)
          }`
        );
      }
    }

    console.log("Raw items:", JSON.stringify(items).slice(0, 200) + "...");

    items = items.map(sanitizeItem);

    console.log(
      "Sanitized items:",
      JSON.stringify(items).slice(0, 200) + "..."
    );

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
