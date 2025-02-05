import { useEffect, JSX } from "react";
import { getCalendarEvents } from "@lib/helpers";
import { twoWeeksDefault } from "@lib/dates";
import Events from "@components/ui/events";
import { initializeStore } from "@utils/initializeStore";
import type { GetStaticProps } from "next";
import { Event, EventLocation } from "../store";

interface InitialState {
  events: Event[];
  noEventsFound: boolean;
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

  const { events } = initialState;

  return (
    <>
      <Events events={events} />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const { from, until } = twoWeeksDefault();

  let { events } = await getCalendarEvents({
    from,
    until,
  });

  let noEventsFound = false;
  if (events.length === 0) {
    noEventsFound = true;
  }

  const initialState: InitialState = {
    events,
    noEventsFound,
  };

  return {
    props: {
      initialState,
    },
    revalidate: 60,
  };
};
