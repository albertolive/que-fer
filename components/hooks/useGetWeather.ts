import { siteUrl } from "@config/index";
import useSWR from "swr";

const fetchWeather = ([url, location]) =>
  fetch(`${siteUrl}${url}?location=${encodeURIComponent(location)}`).then((r) =>
    r.json()
  );

export const useGetWeather = (isLessThanFiveDays, location) => {
  const swrKey = isLessThanFiveDays ? [`/api/getWeather`, location] : null;
  const swrFetcher = (...args) => fetchWeather(...args);

  return useSWR(swrKey, swrFetcher, {});
};
