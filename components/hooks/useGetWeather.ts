import { siteUrl } from "@config/index";
import useSWR from "swr";

interface WeatherData {
  temp?: number;
  description?: string;
  icon?: string;
}

type FetchWeatherArgs = [string, string];
type SwrFetcherArgs = [string, string];

const fetchWeather = async ([url, location]: FetchWeatherArgs): Promise<WeatherData> => {
  const response = await fetch(`${siteUrl}${url}?location=${encodeURIComponent(location)}`);
    if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const useGetWeather = (isLessThanFiveDays: boolean, location: string) => {
  const swrKey = isLessThanFiveDays ? [`/api/getWeather`, location] : null;
  const swrFetcher = (...args: SwrFetcherArgs) => fetchWeather(args);

  return useSWR<WeatherData>(swrKey, swrFetcher, {});
};
