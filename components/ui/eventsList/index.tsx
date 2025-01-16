// @ts-nocheck
import {
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactElement,
  RefObject,
} from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import Meta from "@components/partials/seo-meta";
import { generatePagesData } from "@components/partials/generatePagesData";
import { useGetEvents } from "@components/hooks/useGetEvents";
import {
  generateJsonData,
  getPlaceTypeAndLabel,
  getDistance,
} from "@utils/helpers";
import { dateFunctions } from "@utils/constants";
import List from "@components/ui/list";
import CardLoading from "@components/ui/cardLoading";
import Card from "@components/ui/card";
import { CATEGORIES } from "@utils/constants";
import useOnScreen from "@components/hooks/useOnScreen";
import useStore from "@store";
import { Event, UserLocation } from "@store";

const NoEventsFound = dynamic(
  () => import("@components/ui/common/noEventsFound"),
  {
    loading: () => null,
  }
);

interface EventsListProps {
  events?: Event[];
}

interface PageData {
  metaTitle: string;
  metaDescription: string;
  title: string;
  subTitle: string;
  canonical: string;
  notFoundText: string;
}

interface FetchedData {
  events?: Event[];
  noEventsFound?: boolean;
  allEventsLoaded?: boolean;
}

function EventsList({
  events: serverEvents = [],
}: EventsListProps): ReactElement {
  const {
    noEventsFound: serverNoEventsFound,
    place,
    byDate,
    category,
    searchTerm,
    userLocation,
    distance,
    page,
    scrollPosition,
    currentYear,
    setState,
  } = useStore((state) => ({
    events: state.events,
    noEventsFound: state.noEventsFound,
    place: state.place,
    byDate: state.byDate,
    category: state.category,
    searchTerm: state.searchTerm,
    userLocation: state.userLocation,
    distance: state.distance,
    page: state.page,
    scrollPosition: state.scrollPosition,
    currentYear: state.currentYear,
    setState: state.setState,
  }));

  const noEventsFoundRef = useRef<Element>(null) as RefObject<Element>;
  const divRef = useRef<HTMLDivElement>(null);
  const isNoEventsFoundVisible = useOnScreen(noEventsFoundRef, {
    freezeOnceVisible: true,
  });
  const isBrowser = typeof window !== "undefined";

  // State
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derived state
  const { type, label, regionLabel } = getPlaceTypeAndLabel(place);
  const categoryQuery = category ? CATEGORIES[category] || category : "";
  const sharedQuery = `${searchTerm} ${categoryQuery} ${label}`;
  const pageIndex = dateFunctions[byDate] || "all";

  const {
    data: fetchedData = {} as FetchedData,
    isValidating,
    error,
  } = useGetEvents({
    props: {
      events: serverEvents,
      noEventsFound: serverNoEventsFound,
      currentYear,
      allEventsLoaded: false,
    },
    pageIndex,
    maxResults: page * 10,
    q: type === "town" ? `${sharedQuery} ${regionLabel}` : sharedQuery,
    town: type === "town" ? label : "",
  });

  const events = fetchedData.events?.length ? fetchedData.events : serverEvents;
  const noEventsFound = fetchedData.noEventsFound ?? serverNoEventsFound;
  const allEventsLoaded = fetchedData.allEventsLoaded ?? false;

  const notFound =
    !isLoading &&
    !isValidating &&
    (noEventsFound || filteredEvents.length === 0);

  const jsonEvents = events
    .filter(({ isAd }) => !isAd)
    .map((event) => {
      try {
        return generateJsonData(event);
      } catch (err) {
        console.error("Error generating JSON data for event:", err, event);
        return null;
      }
    })
    .filter(Boolean);

  // Event handlers
  const handleLoadMore = useCallback(() => {
    if (isBrowser) {
      setState("scrollPosition", window.scrollY);
      window.gtag?.("event", "load-more-events");
    }

    setIsLoadingMore(true);
    setState("page", page + 1);
  }, [isBrowser, page, setState]);

  const filterEventsByDistance = useCallback(
    (events: Event[], userLocation: UserLocation | null) => {
      if (!distance || isNaN(distance)) return events;

      return events.filter((event) => {
        if (event.isAd || !event.coords || !userLocation) {
          return true;
        }

        const eventDistance = getDistance(userLocation, event.coords);
        return eventDistance <= distance;
      });
    },
    [distance]
  );

  // Effects
  useEffect(() => {
    if (events.length > 0) {
      setIsLoadingMore(false);
    }
  }, [events]);

  useEffect(() => {
    if (events.length > 0) {
      const filtered = filterEventsByDistance(events, userLocation);
      setFilteredEvents((prevFilteredEvents) => {
        if (JSON.stringify(prevFilteredEvents) !== JSON.stringify(filtered)) {
          return filtered;
        }
        return prevFilteredEvents;
      });
    }
  }, [events, filterEventsByDistance, userLocation]);

  useEffect(() => {
    const shouldLoad = events.length === 0 && !error && isValidating;
    setIsLoading((prevLoading) =>
      prevLoading !== shouldLoad ? shouldLoad : prevLoading
    );
  }, [events.length, error, isValidating]);

  useEffect(() => {
    if (isBrowser) {
      if (window.performance.navigation.type === 1) {
        setState("scrollPosition", 0);
      } else {
        const storedScrollPosition = scrollPosition;
        if (storedScrollPosition) {
          window.scrollTo(0, parseInt(storedScrollPosition));
        }
      }
    }
  }, [isBrowser, scrollPosition, setState]);

  useEffect(() => {
    if (scrollPosition) {
      window.scrollTo(0, parseInt(scrollPosition));
    }
  }, [events.length, scrollPosition]);

  // Page data
  const {
    metaTitle,
    metaDescription,
    title,
    subTitle,
    canonical,
    notFoundText,
  }: PageData =
    generatePagesData({
      currentYear,
      place,
      byDate,
    }) || {};

  // Error handling
  if (error) return <NoEventsFound title={notFoundText} />;

  // Render
  return (
    <>
      <Script
        id={`${place || "catalunya"}-${byDate || "all"}-script`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonEvents) }}
      />
      <Meta
        title={metaTitle}
        description={metaDescription}
        canonical={canonical}
      />
      <div className="w-full flex-col justify-center items-center sm:w-[580px] md:w-[768px] lg:w-[1024px] mt-32">
        {notFound && (
          <>
            <div ref={divRef} />
            {isNoEventsFoundVisible && <NoEventsFound title={notFoundText} />}
          </>
        )}
        {!notFound && (
          <>
            <h1 className="uppercase mb-2 px-2">{title}</h1>
            <p className="text-[16px] font-normal text-blackCorp text-left mb-10 px-2 font-barlow">
              {subTitle}
            </p>
          </>
        )}
        {(isLoading || isValidating) && !isLoadingMore ? (
          <div>
            {[...Array(10)].map((_, i) => (
              <CardLoading key={i} />
            ))}
          </div>
        ) : (
          <List events={filteredEvents}>
            {(event: Event, index: number) => (
              <Card key={event.id} event={event} isPriority={index === 0} />
            )}
          </List>
        )}
        {isLoadingMore && <CardLoading />}
        {!noEventsFound &&
          filteredEvents.length > 7 &&
          !isLoadingMore &&
          !allEventsLoaded && (
            <div className="h-12 flex justify-center items-center text-center pt-10 pb-14">
              <button
                type="button"
                className="w-[120px] bg-whiteCorp flex justify-center items-center gap-2 font-barlow italic uppercase tracking-wider font-semibold p-2 border-2 border-bColor rounded-lg hover:bg-primary hover:text-whiteCorp hover:border-whiteCorp ease-in-out duration-300 focus:outline-none"
                onClick={handleLoadMore}
              >
                Carregar més
              </button>
            </div>
          )}
      </div>
    </>
  );
}

export default memo(EventsList);
