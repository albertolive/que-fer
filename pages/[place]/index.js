import { useEffect } from "react";
import dynamic from "next/dynamic";
import { getCalendarEvents } from "@lib/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { initializeStore } from "@utils/initializeStore";
import { twoWeeksDefault } from "@lib/dates";

const CardLoadingExtended = dynamic(
  () => import("@components/ui/cardLoadingExtended"),
  {
    loading: () => (
      <div className="flex justify-center items-center w-full">
        <div className="w-full h-60 bg-darkCorp animate-fast-pulse"></div>
      </div>
    ),
  }
);

const Events = dynamic(() => import("@components/ui/events"), {
  ssr: true,
});

const EventsCategorized = dynamic(
  () => import("@components/ui/eventsCategorized"),
  {
    loading: () => <CardLoadingExtended />,
    ssr: false,
  }
);

const EventsList = dynamic(() => import("@components/ui/eventsList"), {
  ssr: true,
});

export default function Place({ initialState }) {
  useEffect(() => {
    initializeStore(initialState);
  }, [initialState]);

  return (
    <Events
      events={initialState.events}
      hasServerFilters={initialState.hasServerFilters}
      ListComponent={EventsList}
      CategorizedComponent={EventsCategorized}
    />
  );
}

export async function getStaticPaths() {
  const { CITIES_DATA } = require("@utils/constants");

  const paths = [];

  for (const [regionKey, region] of CITIES_DATA) {
    paths.push({
      params: {
        place: regionKey,
      },
    });

    for (const [townKey] of region.towns) {
      paths.push({
        params: {
          place: townKey,
        },
      });
    }
  }

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { from, until } = twoWeeksDefault();
  const { place } = params;
  const { type, label, regionLabel } = getPlaceTypeAndLabel(place);
  let { events } = await getCalendarEvents({
    from,
    until,
    q: type === "town" ? `${label} ${regionLabel}` : label,
    town: type === "town" ? label : "",
  });

  let noEventsFound = false;

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
