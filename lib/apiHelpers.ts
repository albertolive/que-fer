import axios from "axios";
import { captureException } from "@sentry/nextjs";
import { env, getFormattedDate, slug } from "@utils/helpers";
import { getAuthToken } from "@lib/auth";
import { siteUrl } from "@config/index";

export async function postToGoogleCalendar(event, authToken) {
  try {
    const token = authToken || (await getAuthToken());

    const response = await axios.post(
      `https://www.googleapis.com/calendar/v3/calendars/${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR}@group.calendar.google.com/events`,
      event,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (env === "prod") {
      try {
        await indexEvent(response.data);
      } catch (err) {
        console.error(`Error occurred while indexing event: ${err.message}`);
        captureException(err);
      }
    }

    return response;
  } catch (error) {
    console.error(
      `Error occurred while posting to Google Calendar: ${error.message}`
    );
    captureException(error);
    throw new Error(`Error posting to Google Calendar: ${error.message}`);
  }
}

export async function updateGoogleCalendarEvent(event) {
  try {
    const response = await axios.put(
      process.env.NEXT_PUBLIC_EDIT_EVENT,
      event,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (env === "prod") {
      try {
        // await indexEvent(event);
      } catch (err) {
        console.error(`Error occurred while indexing event: ${err.message}`);
        captureException(err);
      }
    }

    return response;
  } catch (error) {
    console.error(
      `Error occurred while updating Google Calendar: ${error.message}`
    );
    captureException(error);
    throw new Error(`Error updating Google Calendar: ${error.message}`);
  }
}

export async function indexEvent({ start, end, summary, id }) {
  try {
    // Get the originalFormattedStart value
    const { originalFormattedStart } = getFormattedDate(start, end);

    // Construct the URL using the slug function
    const eventUrl = `${siteUrl}/e/${slug(
      summary,
      originalFormattedStart,
      id
    )}`;

    // Call the new function to index the event to Google Search
    await axios.post(`${siteUrl}/api/indexEvent`, { url: eventUrl });
  } catch (err) {
    const errorMessage = `Error occurred while indexing event ${id}: ${err.message}`;
    console.error(errorMessage);
    captureException(err);
    throw new Error(errorMessage);
  }
}
