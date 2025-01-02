import { captureException } from "@sentry/nextjs";
import useSWR, { preload } from "swr";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  url: string;
  imageUrl?: string;
  isAd?: boolean;
}

interface GetCategorizedEventsProps {
  props?: Record<string, any>;
  searchTerms: string[];
  maxResults?: number;
  refreshInterval?: boolean;
}

interface GetCategorizedEventsResponse {
  events: Event[];
  error?: any;
}

const fetcher = async ([url, searchTerms, maxResults]: [string, string[], number]): Promise<GetCategorizedEventsResponse> => {
  const response = await fetch(
    `${url}?searchTerms=${searchTerms.join(",")}&maxResults=${maxResults}`
  );
  return response.json();
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
      fallbackData: props,
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
