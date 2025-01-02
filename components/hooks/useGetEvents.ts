import { captureException } from "@sentry/nextjs";
import useSWR, { preload } from "swr";
import { Event } from "@store";

interface EventsResponse {
  events: Event[];
}

interface EventsProps {
  events?: Event[];
}

interface UseGetEventsProps {
  props?: EventsProps;
  pageIndex: number;
  q?: string;
  refreshInterval?: boolean;
  maxResults?: number;
  town?: string;
}

const fetcher = async ([url, pageIndex, q, maxResults, town]: readonly [string, number, string, number, string]): Promise<EventsResponse> => {
  const response = await fetch(
    `${url}?page=${pageIndex}&q=${q}&maxResults=${maxResults}&town=${town}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useGetEvents = ({
  props = {},
  pageIndex,
  q = "",
  refreshInterval = true,
  maxResults = 10,
  town = "",
}: UseGetEventsProps) => {
  preload(["/api/getEvents", pageIndex, q, maxResults, town], fetcher);

  const hasFallbackData = (props?.events?.length ?? 0) > 0;

  return useSWR<EventsResponse>(["/api/getEvents", pageIndex, q, maxResults, town], fetcher, {
    fallbackData: hasFallbackData ? { ...props, events: props.events || [] } : undefined,
    refreshInterval: refreshInterval ? 300000 : 0,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true, // Revalidate if data is stale
    refreshWhenOffline: false,
    suspense: true,
    keepPreviousData: true,
    revalidateOnMount: !hasFallbackData, // Avoid revalidating on mount
    dedupingInterval: 2000, // Deduplicate requests within 2 seconds
    focusThrottleInterval: 5000, // Throttle focus revalidation to every 5 seconds
    errorRetryInterval: 5000, // Retry errors every 5 seconds
    errorRetryCount: 3, // Retry up to 3 times
    onError: (error: Error) => {
      console.error("Error fetching events:", error);
      captureException(error);
    },
  });
};
