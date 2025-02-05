import { siteUrl } from "@config/index";
import useSWR, { preload } from "swr";
import { EventDetailResponseDTO } from "types/api/event";

interface EventProps {
  event: EventDetailResponseDTO;
}

const fetchWithId = async ([url, id]: [
  string | null,
  string
]): Promise<EventDetailResponseDTO> => {
  if (!url || !id) {
    throw new Error("URL and ID are required");
  }
  const response = await fetch(`${siteUrl}${url}?eventId=${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useGetEvent = (props: EventProps): EventDetailResponseDTO => {
  const eventId = props.event.slug;

  preload([eventId ? `/api/getEvent` : null, eventId], fetchWithId);

  return useSWR([eventId ? `/api/getEvent` : null, eventId], fetchWithId, {
    fallbackData: props.event,
    refreshInterval: 300000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    suspense: true,
    keepPreviousData: true,
    revalidateOnMount: false,
  }).data;
};
