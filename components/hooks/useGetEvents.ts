import { captureException } from "@sentry/nextjs";
import useSWR, { preload } from "swr";

const fetcher = ([url, pageIndex, q, maxResults, town]) =>
  fetch(
    `${url}?page=${pageIndex}&q=${q}&maxResults=${maxResults}&town=${town}`
  ).then((res) => res.json());

export const useGetEvents = ({
  props = {},
  pageIndex,
  q = "",
  refreshInterval = true,
  maxResults = 10,
  town = "",
}) => {
  preload(["/api/getEvents", pageIndex, q, maxResults, town], fetcher);

  const hasFallbackData = props?.events?.length > 0;

  return useSWR(["/api/getEvents", pageIndex, q, maxResults, town], fetcher, {
    fallbackData: hasFallbackData ? props : {}, // Use fallbackData only if props has events
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
    onError: (error) => {
      console.error("Error fetching events:", error);
      captureException(error);
    },
  });
};
