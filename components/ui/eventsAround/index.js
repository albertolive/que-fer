import React, { useEffect, useState } from "react";
import ChartBarIcon from "@heroicons/react/outline/ChartBarIcon";
import { captureException } from "@sentry/nextjs";
import EventsAroundScroll from "../eventsAroundScroll";

const EventsAround = ({ id, title, town, region }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `/api/getEventsAround?id=${id}&title=${title}&town=${town}&region=${region}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          // Handle case where API explicitly returns an error
          throw new Error(data.error);
        }
        setEvents(data.events || []);
      } catch (error) {
        const errorMessage = `Failed to fetch around events for "${id} ${title} ${town}, ${region}": ${error}`;
        console.error(errorMessage);
        setError(
          "Ho sentim, però no hem pogut carregar els esdeveniments en aquest moment."
        );
        captureException(new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [town, region, id, title]);

  if (error) {
    return <div>{error}</div>;
  }

  return <EventsAroundScroll events={events} loading={loading} />;
};

export default EventsAround;
