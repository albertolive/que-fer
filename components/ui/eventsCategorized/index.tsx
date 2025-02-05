// @ts-nocheck
import { memo, useCallback, useEffect, useState, ReactElement } from "react";
import Script from "next/script";
import dynamic from "next/dynamic";
import ChevronRightIcon from "@heroicons/react/solid/ChevronRightIcon";
import SpeakerphoneIcon from "@heroicons/react/outline/SpeakerphoneIcon";
import Meta from "@components/partials/seo-meta";
import { generatePagesData } from "@components/partials/generatePagesData";
import { useGetEvents } from "@components/hooks/useGetEvents";
import { generateJsonData, sendEventToGA } from "@utils/helpers";
import { MAX_RESULTS } from "@utils/constants";
import List from "@components/ui/list";
import CardLoading from "@components/ui/cardLoading";
import Card from "@components/ui/card";
import EventsHorizontalScroll from "@components/ui/eventsHorizontalScroll";
import { SEARCH_TERMS_SUBSET, CATEGORY_NAMES_MAP } from "@utils/constants";
import useStore, { Event, EventCategory } from "@store";

type ByDateOptions = "avui" | "dema" | "setmana" | "cap-de-setmana" | "";

interface PageData {
  metaTitle: string;
  metaDescription: string;
  title: string;
  subTitle: string;
  canonical: string;
  notFoundText: string;
}

const NoEventsFound = dynamic(
  () => import("@components/ui/common/noEventsFound"),
  {
    loading: () => null,
  }
);

const AdArticle = dynamic(() => import("@components/ui/adArticle"), {
  loading: () => null,
  ssr: false,
});

function EventsCategorized(): ReactElement {
  const {
    categorizedEvents: initialCategorizedEvents,
    latestEvents: initialLatestEvents,
    place,
    byDate,
    currentYear,
    setState,
  } = useStore((state) => ({
    categorizedEvents: state.categorizedEvents,
    latestEvents: state.latestEvents,
    place: state.place,
    byDate: state.byDate as ByDateOptions,
    currentYear: state.currentYear,
    setState: state.setState,
  }));

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    data: fetchedData = {
      categorizedEvents: initialCategorizedEvents,
      latestEvents: initialLatestEvents,
      currentYear: new Date().getFullYear(),
      noEventsFound: false,
    },
    isValidating,
    error,
  } = useGetEvents({
    props: {
      events: initialCategorizedEvents,
      latestEvents: initialLatestEvents,
    },
    searchTerms: SEARCH_TERMS_SUBSET,
    maxResults: MAX_RESULTS,
  });

  const events = fetchedData.events?.length ? fetchedData.events : serverEvents;
  const noEventsFound = fetchedData.noEventsFound ?? serverNoEventsFound;
  const allEventsLoaded = fetchedData.allEventsLoaded ?? false;

  const notFound =
    !isLoading &&
    !isValidating &&
    (noEventsFound || filteredEvents.length === 0);

  const scrollToTop = useCallback((): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const onCategoryClick = useCallback(
    (category: string): void => {
      setState("category", category as EventCategory);
      sendEventToGA("Category", category);
      scrollToTop();
    },
    [setState, scrollToTop]
  );

  // Effects
  useEffect(() => {
    const shouldLoad =
      Object.keys(categorizedEvents).length === 0 && !error && !isValidating;
    setIsLoading((prevLoading) =>
      prevLoading !== shouldLoad ? shouldLoad : prevLoading
    );
  }, [categorizedEvents, error, isValidating]);

  const eventKeys = Object.keys(categorizedEvents || {});

  const generateEventJsonData = (event: Event) => {
    try {
      return generateJsonData(event);
    } catch (err) {
      console.error("Error generating JSON data for event:", err, event);
      return null;
    }
  };

  const getCategoryName = (category: string): string => {
    return Object.entries(CATEGORY_NAMES_MAP).reduce(
      (acc, [key, value]) => (key === category ? value : acc),
      category
    );
  };

  const getEventsForCategory = (category: string): Event[] => {
    return categorizedEvents?.[category] || [];
  };

  const jsonEvents = [
    ...eventKeys
      .flatMap((category) => getEventsForCategory(category))
      .filter((event): event is Event => !event.isAd)
      .map(
        (event) =>
          generateEventJsonData(event) as ReturnType<typeof generateJsonData>
      )
      .filter(Boolean),
    ...latestEvents
      .filter((event): event is Event => !event.isAd)
      .map(
        (event) =>
          generateEventJsonData(event) as ReturnType<typeof generateJsonData>
      )
      .filter(Boolean),
  ];

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
      currentYear: currentYear || new Date().getFullYear(),
      place: place || "",
      byDate,
    }) || {};

  // Error handling
  if (error) return <NoEventsFound title={notFoundText} />;

  let priorityCount = 0;

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
        <>
          <h1 className="uppercase mb-2 px-2">{title}</h1>
          <p className="text-[16px] font-normal text-blackCorp text-left px-2 font-barlow">
            {subTitle}
          </p>
        </>
        {isLoading || isValidating ? (
          <>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="mt-9 ml-2">
                <div className="w-10/12 flex justify-start items-center animate-fast-pulse mb-4">
                  <div className="w-2/3 h-5 bg-darkCorp rounded-xl"></div>
                </div>
                <div className="mt-0.5">
                  <CardLoading key={i} />
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-2">
            {eventKeys.length > 0 &&
              eventKeys.map((category, index) => {
                const shouldUsePriority = priorityCount < 2;
                if (shouldUsePriority) {
                  priorityCount += 1;
                }
                const events = getEventsForCategory(category);
                return events.length > 0 ? (
                  <div key={category}>
                    <div className="flex justify-between mt-4 mb-2">
                      <h2 className="font-semibold">
                        {getCategoryName(category)}
                      </h2>
                      <div
                        className="flex justify-between items-center cursor-pointer text-primary"
                        onClick={() => onCategoryClick(category)}
                      >
                        <div className="flex items-center">
                          Veure més
                          <ChevronRightIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <EventsHorizontalScroll
                      events={events}
                      usePriority={shouldUsePriority}
                    />
                    {/* Ad */}
                    {(index === 1 || index === 3) && (
                      <div className="w-full h-full flex flex-col items-start min-h-[250px] max-w-lg gap-2 mt-4 mb-2">
                        <div className="w-full flex">
                          <SpeakerphoneIcon className="w-5 h-5 mt-1 mr-2" />
                          <div className="w-11/12 flex flex-col gap-4">
                            <h2>Contingut patrocinat</h2>
                          </div>
                        </div>
                        <div className="w-full">
                          <AdArticle slot="8139041285" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            {latestEvents.length > 0 && (
              <>
                <h2 className="font-semibold mt-4 mb-6">
                  Altres esdeveniments
                </h2>
                <List events={latestEvents}>
                  {(event) => (
                    <Card key={event.id} event={event} isPriority={false} />
                  )}
                </List>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default memo(EventsCategorized);
