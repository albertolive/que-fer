import { siteUrl } from "@config/index";
import useSWR, { preload } from "swr";
import { Event } from "@store";

interface EventProps {
  event: Event;
}

const fetchWithId = async ([url, id]: [string | null, string]): Promise<Event> => {
  if (!url || !id) {
    throw new Error("URL and ID are required");
  }
  const response = await fetch(`${siteUrl}${url}?eventId=${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
};

export const useGetEvent = (props: EventProps) => {
  const eventId = props.event.slug;

  preload([eventId ? `/api/getEvent` : null, eventId], fetchWithId);

  return useSWR<Event>([eventId ? `/api/getEvent` : null, eventId], fetchWithId, {
    fallbackData: props.event,
    refreshInterval: 300000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    suspense: true,
    keepPreviousData: true,
    revalidateOnMount: false,
  });
};
