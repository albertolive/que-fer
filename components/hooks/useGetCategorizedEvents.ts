import { captureException } from "@sentry/nextjs";
import useSWR, { preload } from "swr";

const fetcher = ([url, searchTerms, maxResults]) =>
  fetch(
    `${url}?searchTerms=${searchTerms.join(",")}&maxResults=${maxResults}`
  ).then((res) => res.json());

export const useGetCategorizedEvents = ({
  props = {},
  searchTerms,
  maxResults = 10,
  refreshInterval = true,
}) => {
  preload(["/api/getCategorizedEvents", searchTerms, maxResults], fetcher);

  return useSWR(
    ["/api/getCategorizedEvents", searchTerms, maxResults],
    fetcher,
    {
      fallbackData: props,
      refreshInterval: refreshInterval ? 300000 : 0,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateIfStale: true, // Revalidate if data is stale
      refreshWhenOffline: false,
      suspense: true,
      keepPreviousData: true,
      revalidateOnMount: false, // Avoid revalidating on mount
      dedupingInterval: 2000, // Deduplicate requests within 2 seconds
      focusThrottleInterval: 5000, // Throttle focus revalidation to every 5 seconds
      errorRetryInterval: 5000, // Retry errors every 5 seconds
      errorRetryCount: 3, // Retry up to 3 times
      onError: (error) => {
        console.error("Error fetching events:", error);
        captureException(error);
      },
    }
  );
};
