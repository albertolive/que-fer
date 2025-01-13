import { useEffect } from "react";
import { getCalendarEvents } from "@lib/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { initializeStore } from "@utils/initializeStore";
import { today, tomorrow, week, weekend, twoWeeksDefault } from "@lib/dates";
import Events from "@components/ui/events";

export default function ByDate({ initialState }) {
  useEffect(() => {
    initializeStore(initialState);
  }, [initialState]);

  return (
    <Events
      events={initialState.events}
      hasServerFilters={initialState.hasServerFilters}
    />
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { place, byDate } = params;

  const dateFunctions = {
    avui: today,
    dema: tomorrow,
    setmana: week,
    "cap-de-setmana": weekend,
  };

  const selectedFunction = dateFunctions[byDate] || today;

  const { type, label, regionLabel } = getPlaceTypeAndLabel(place);
  const q = type === "town" ? `${label} ${regionLabel}` : label;

  const { from, until } = selectedFunction();
  let { events } = await getCalendarEvents({ from, until, q });

  let noEventsFound = false;

  if (events.length === 0) {
    const { from, until } = twoWeeksDefault();
    const nextEventsResult = await getCalendarEvents({
      from,
      until,
      maxResults: 7,
      q,
      town: type === "town" ? label : "",
    });

    noEventsFound = true;
    events = nextEventsResult.events;
  }

  if (events.length === 0) {
    const { from, until } = twoWeeksDefault();
    const nextEventsResult = await getCalendarEvents({
      from,
      until,
      maxResults: 7,
      q: label,
    });

    noEventsFound = true;
    events = nextEventsResult.events;
  }

  const initialState = {
    place,
    byDate,
    events,
    noEventsFound,
    hasServerFilters: true,
  };

  return {
    props: {
      initialState,
    },
    revalidate: 60,
  };
}
