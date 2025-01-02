import { siteUrl } from "@config/index";
import useSWR, { preload } from "swr";

const fetchWithId = ([url, id]) =>
  fetch(`${siteUrl}${url}?eventId=${id}`).then((r) => r.json());

export const useGetEvent = (props) => {
  const eventId = props.event.slug;

  preload([eventId ? `/api/getEvent` : null, eventId], fetchWithId);

  return useSWR([eventId ? `/api/getEvent` : null, eventId], fetchWithId, {
    fallbackData: props,
    refreshInterval: 300000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshWhenOffline: false,
    suspense: true,
    keepPreviousData: true,
    revalidateOnMount: false,
  });
};
