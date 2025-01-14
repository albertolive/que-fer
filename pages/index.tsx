import { useEffect, JSX } from "react";
import { getCategorizedEvents, getLatestEvents } from "@lib/helpers";
import { twoWeeksDefault } from "@lib/dates";
import { MAX_RESULTS, SEARCH_TERMS_SUBSET } from "@utils/constants";
import Events from "@components/ui/events";
import { initializeStore } from "@utils/initializeStore";
import type { GetStaticProps } from "next";
import { Event, EventLocation } from "../store";

interface InitialState {
  categorizedEvents: Record<string, Event[]>;
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

  return (
    <>
      <Events
        events={categorizedEvents.events || []}
        hasServerFilters={false}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const { from, until } = twoWeeksDefault();

  const initialState: InitialState = {
    categorizedEvents: { events: [] },
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
