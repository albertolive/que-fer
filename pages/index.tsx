import { useEffect, JSX } from "react";
import { getCategorizedEvents, getLatestEvents } from "@lib/helpers";
import { twoWeeksDefault } from "@lib/dates";
import { MAX_RESULTS, SEARCH_TERMS_SUBSET } from "@utils/constants";
import Events from "@components/ui/events";
import { initializeStore } from "@utils/initializeStore";
import type { GetStaticProps } from "next";
import {
  Event,
  EventLocation,
  EventCategory,
  CategorizedEvents,
} from "../store";

interface InitialState {
  categorizedEvents: CategorizedEvents;
  latestEvents: Event[];
  userLocation?: EventLocation | null;
  currentYear?: number;
}

interface HomeProps {
  initialState: InitialState;
}

export default function Home({ initialState }: HomeProps): JSX.Element {
  useEffect(() => {
    initializeStore(initialState);
  }, [initialState]);

  const { categorizedEvents } = initialState;

  const allEvents = Object.values(categorizedEvents).flatMap(
    (events) => events
  );
  return (
    <>
      <Events events={allEvents} hasServerFilters={false} />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const { from, until } = twoWeeksDefault();

  const initialState: InitialState = {
    categorizedEvents: Object.values(EventCategory).reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<EventCategory, Event[]>),
    latestEvents: [],
  };

  const [categorizedResult, latestResult] = await Promise.allSettled([
    getCategorizedEvents({
      searchTerms: SEARCH_TERMS_SUBSET,
      from,
      until,
      maxResults: MAX_RESULTS,
      filterByDate: true,
    }),
    getLatestEvents({
      from,
      until,
      maxResults: MAX_RESULTS,
      filterByDate: true,
    }),
  ]);

  if (categorizedResult.status === "fulfilled") {
    initialState.categorizedEvents = categorizedResult.value || {};
  }

  if (latestResult.status === "fulfilled") {
    initialState.latestEvents = latestResult.value.events || [];
  }

  return {
    props: {
      initialState,
    },
    revalidate: 60,
  };
};
