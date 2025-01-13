import { useEffect } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { getCalendarEvents } from "@lib/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { initializeStore } from "@utils/initializeStore";
import { today, tomorrow, week, weekend, twoWeeksDefault } from "@lib/dates";
import Events from "@components/ui/events";
import { Event } from "@store";

interface DateFunction {
  (): {
    from: Date;
    until: Date;
  };
}

interface DateFunctions {
  [key: string]: DateFunction;
}

interface InitialState {
  place: string;
  byDate: string;
  events: Event[];
  noEventsFound: boolean;
  hasServerFilters: boolean;
}

interface ByDateProps {
  initialState: InitialState;
}

export default function ByDate({ initialState }: ByDateProps): JSX.Element {
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

interface StaticProps {
  params: {
    place: string;
    byDate: string;
  };
}

export const getStaticProps: GetStaticProps<
  ByDateProps,
  StaticProps["params"]
> = async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const { place, byDate } = params;

  const dateFunctions: DateFunctions = {
    avui: today,
    dema: tomorrow,
    setmana: week,
    "cap-de-setmana": weekend,
  };

  const selectedFunction = dateFunctions[byDate] || today;

  const { type, label, regionLabel } = getPlaceTypeAndLabel(place) as {
    type: string;
    label: string;
    regionLabel: string;
  };
  const q = type === "town" ? `${label} ${regionLabel}` : label;

  const { from, until } = selectedFunction();
  let { events } = (await getCalendarEvents({ from, until, q })) as {
    events: Event[];
  };

  let noEventsFound = false;

  if (events.length === 0) {
    const { from, until } = twoWeeksDefault();
    const nextEventsResult = (await getCalendarEvents({
      from,
      until,
      maxResults: 7,
      q,
      town: type === "town" ? label : "",
    })) as { events: Event[] };

    noEventsFound = true;
    events = nextEventsResult.events;
  }

  if (events.length === 0) {
    const { from, until } = twoWeeksDefault();
    const nextEventsResult = (await getCalendarEvents({
      from,
      until,
      maxResults: 7,
      q: label,
    })) as { events: Event[] };

    noEventsFound = true;
    events = nextEventsResult.events;
  }

  const initialState: InitialState = {
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
};
