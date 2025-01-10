import { captureException } from "@sentry/nextjs";
import useSWR, { preload, BareFetcher } from "swr";
import { Event as StoreEvent, EventCategory } from "@store";

interface Event extends Omit<StoreEvent, 'distance' | 'weather'> {
  category: EventCategory;
}

interface GetCategorizedEventsProps {
  props?: Record<string, any>;
  searchTerms: string[];
  maxResults?: number;
  refreshInterval?: boolean;
}

interface GetCategorizedEventsResponse {
  categorizedEvents: Record<string, Event[]>;
  latestEvents: Event[];
  currentYear: number;
  noEventsFound: boolean;
}

const fetcher: BareFetcher<GetCategorizedEventsResponse> = async (args: readonly [string, string[], number]) => {
  const [url, searchTerms, maxResults] = args;
  const response = await fetch(
    `${url}?searchTerms=${searchTerms.join(",")}&maxResults=${maxResults}`
  );
  const data = await response.json();
  return data as GetCategorizedEventsResponse;
};

export const useGetCategorizedEvents = ({
  props = {},
  searchTerms,
  maxResults = 10,
  refreshInterval = true,
}: GetCategorizedEventsProps) => {
  preload(["/api/getCategorizedEvents", searchTerms, maxResults], fetcher);

  return useSWR<GetCategorizedEventsResponse>(
    ["/api/getCategorizedEvents", searchTerms, maxResults],
    fetcher,
    {
      fallbackData: {
        categorizedEvents: props.categorizedEvents || {},
        latestEvents: props.latestEvents || [],
        currentYear: new Date().getFullYear(),
        noEventsFound: false,
      },
      refreshInterval: refreshInterval ? 300000 : 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true,
      refreshWhenOffline: false,
      suspense: true,
      keepPreviousData: true,
      revalidateOnMount: false,
      dedupingInterval: 2000,
      focusThrottleInterval: 5000,
      errorRetryInterval: 5000,
      errorRetryCount: 3,
      onError: (error) => {
        console.error("Error fetching events:", error);
        captureException(error);
      },
    }
  );
};
