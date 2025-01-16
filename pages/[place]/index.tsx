import { useEffect, JSX } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { getCalendarEvents } from "@lib/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { twoWeeksDefault } from "@lib/dates";
import Events from "@components/ui/events";
import { initializeStore } from "@utils/initializeStore";
import { getRegions } from "@lib/apiHelpers";

interface InitialState {
  place: string;
  events: any[]; // Replace with proper Event interface from your types
  noEventsFound: boolean;
  hasServerFilters: boolean;
}

interface PlaceProps {
  initialState: InitialState;
}

interface StaticPathParams {
  place: string;
  [key: string]: string | string[] | undefined;
}

export default function Place({ initialState }: PlaceProps): JSX.Element {
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

export const getStaticPaths: GetStaticPaths<StaticPathParams> = async () => {
  const paths: Array<{ params: StaticPathParams }> = [];

  const regions = await getRegions();

  for (const regionSlug of Object.keys(regions)) {
    const region = regions[regionSlug];
    paths.push({
      params: {
        place: region.slug,
      },
    });
  }

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<
  PlaceProps,
  StaticPathParams
> = async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const { from, until } = twoWeeksDefault();
  const { place } = params;
  const { type, label, regionLabel } = await getPlaceTypeAndLabel(place);
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

  const initialState: InitialState = {
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
};
