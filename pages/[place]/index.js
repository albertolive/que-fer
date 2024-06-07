import { useEffect } from "react";
import { getCalendarEvents } from "@lib/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { twoWeeksDefault } from "@lib/dates";
import Events from "@components/ui/events";
import { initializeStore } from "@utils/initializeStore";

export default function Home(props) {
  useEffect(() => {
    initializeStore(props.initialState);
  }, [props.initialState]);

  return <Events />;
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
  const { events } = await getCalendarEvents({
    from,
    until,
    q: type === "town" ? `${label} ${regionLabel}` : label,
    shuffleItems: true,
    town: type === "town" ? label : "",
  });

  const initialState = {
    latestEvents: events,
  };

  return {
    props: {
      initialState,
    },
    revalidate: 60,
  };
}
