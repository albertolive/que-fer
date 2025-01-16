// @ts-nocheck
// I'll come back later
import { Event } from "@store";
import {
  DAYS,
  MONTHS,
  CATEGORIES,
  RegionData,
} from "./constants";
import { siteUrl } from "@config/index";

export interface DateObject {
  date?: string;
  dateTime?: string;
}

export interface FormattedDateResult {
  originalFormattedStart: string;
  formattedStart: string;
  formattedEnd: string | null;
  startTime: string;
  endTime: string;
  nameDay: string;
  startDate: Date;
  isLessThanFiveDays: boolean;
  isMultipleDays: boolean;
  duration: string;
}

export interface PlaceTypeAndLabel {
  type: "region" | "town";
  label: string;
  regionLabel?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Option {
  value: string;
  label: string;
}

interface VideoObject {
  "@type": "VideoObject";
  name: string;
  contentUrl: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
}

interface SchemaOrgEvent {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string | undefined;
  url: string;
  startDate: string;
  endDate: string;
  eventAttendanceMode: string;
  eventStatus: string;
  location: {
    "@type": "Place";
    name: string | undefined;
    address: {
      "@type": "PostalAddress";
      streetAddress: string | undefined;
      addressLocality: string | undefined;
      postalCode: string | undefined;
      addressCountry: string;
      addressRegion: string;
    };
  };
  image: string[];
  description: string;
  performer: {
    "@type": "PerformingGroup";
    name: string | undefined;
  };
  organizer: {
    "@type": "Organization";
    name: string | undefined;
    url: string;
  };
  offers: {
    "@type": "Offer";
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    validFrom: string;
  };
  isAccessibleForFree: boolean;
  duration: string;
  video?: VideoObject;
}

const CITIES_DATA: Map<string, RegionData> = new Map([]);

export const isLessThanFiveDays = (date: Date): boolean => {
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - date.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  return Math.floor(Math.abs(dayDiff)) < 5;
};

export const sanitize = (url: string): string => {
  const accents = [
    /[\u0300-\u030f]/g,
    /[\u1AB0-\u1AFF]/g,
    /[\u1DC0-\u1DFF]/g,
    /[\u1F00-\u1FFF]/g,
    /[\u2C80-\u2CFF]/g,
    /[\uFB00-\uFB06]/g,
  ];

  let sanitizedUrl = url.toLowerCase();
  sanitizedUrl = sanitizedUrl.replace(/\s+$/, "");

  accents.forEach((regex) => {
    sanitizedUrl = sanitizedUrl.normalize("NFD").replace(regex, "");
  });

  sanitizedUrl = sanitizedUrl.replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");
  sanitizedUrl = sanitizedUrl.replace(/[-\s]+/g, "-");

  return sanitizedUrl;
};

export const slug = (str: string, formattedStart: string, id: string): string =>
  `${sanitize(str)}-${formattedStart
    .toLowerCase()
    .replace(/ /g, "-")
    .replace("---", "-")
    .replace("ç", "c")
    .replace(/--/g, "-")}-${id}`;

export const convertTZ = (date: Date | string, tzString: string): Date =>
  new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );

function calculateDetailedDurationISO8601(start: Date, end: Date): string {
  const differenceInMs = end.getTime() - start.getTime();

  const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);

  let duration = "P";
  if (days > 0) duration += `${days}D`;

  if (hours > 0 || minutes > 0 || seconds > 0) {
    duration += "T";
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (seconds > 0) duration += `${seconds}S`;
  }

  return duration === "P" ? "PT1H" : duration;
}

export const getFormattedDate = (
  start: string | DateObject,
  end?: string | DateObject
): FormattedDateResult => {
  const startDate = new Date(
    typeof start === "object" ? start.date || start.dateTime || "" : start
  );
  const endDate = end
    ? new Date(typeof end === "object" ? end.date || end.dateTime || "" : end)
    : startDate;

  const startDateConverted = convertTZ(startDate, "Europe/Madrid");
  const endDateConverted = convertTZ(endDate, "Europe/Madrid");
  const duration = calculateDetailedDurationISO8601(startDate, endDate);

  let isMultipleDays = false;
  let isSameMonth = false;
  let isSameYear = false;
  const startDay = startDateConverted.getDate();
  const endDay = endDateConverted.getDate();

  if (startDay !== endDay) isMultipleDays = true;
  if (startDateConverted.getMonth() === endDateConverted.getMonth())
    isSameMonth = true;
  if (startDateConverted.getFullYear() === endDateConverted.getFullYear())
    isSameYear = true;

  const weekDay = startDateConverted.getDay();
  const month = startDateConverted.getMonth();
  const year = startDateConverted.getFullYear();
  const nameDay = DAYS[weekDay];
  const nameMonth = MONTHS[month];

  const originalFormattedStart = `${startDay} de ${nameMonth} del ${year}`;
  const formattedStart =
    isMultipleDays && isSameMonth
      ? `${startDay}`
      : `${startDay} de ${nameMonth}${
          isMultipleDays && isSameYear ? "" : ` del ${year}`
        }`;
  const formattedEnd = `${endDay} de ${
    MONTHS[endDateConverted.getMonth()]
  } del ${endDateConverted.getFullYear()}`;

  const startTime = `${startDateConverted.getHours()}:${String(
    startDateConverted.getMinutes()
  ).padStart(2, "0")}`;
  const endTime = `${endDateConverted.getHours()}:${String(
    endDateConverted.getMinutes()
  ).padStart(2, "0")}`;

  return {
    originalFormattedStart,
    formattedStart,
    formattedEnd: isMultipleDays ? formattedEnd : null,
    startTime,
    endTime,
    nameDay,
    startDate: isMultipleDays
      ? (startDay <= new Date().getDate() &&
          convertTZ(new Date(), "Europe/Madrid")) ||
        startDateConverted
      : startDateConverted,
    isLessThanFiveDays: isLessThanFiveDays(startDate),
    isMultipleDays,
    duration,
  };
};

export const nextDay = (x: number): Date => {
  const now = new Date();
  now.setDate(now.getDate() + ((x + (7 - now.getDay())) % 7));
  const convertedDate = convertTZ(now, "Europe/Madrid");
  return convertedDate;
};

export const isWeekend = (): boolean => {
  const today = new Date();
  return today.getDay() === 0 || today.getDay() === 5 || today.getDay() === 6;
};

export const monthsName: string[] = [
  "gener",
  "febrer",
  "març",
  "abril",
  "maig",
  "juny",
  "juliol",
  "agost",
  "setembre",
  "octubre",
  "novembre",
  "desembre",
];

export const generateJsonData = (event: Event): SchemaOrgEvent => {
  const {
    title,
    slug,
    description,
    startDate,
    endDate,
    location,
    imageUploaded,
    eventImage,
    postalCode,
    subLocation,
    duration,
    videoUrl,
  } = event;

  const defaultImage = `${siteUrl}/static/images/logo-seo-meta.webp`;
  const images = [imageUploaded, eventImage, defaultImage].filter(
    Boolean
  ) as string[];

  const videoObject = videoUrl
    ? {
        "@type": "VideoObject" as const,
        name: title,
        contentUrl: videoUrl,
        description,
        thumbnailUrl: imageUploaded || eventImage || defaultImage,
        uploadDate: startDate,
      }
    : null;

  return {
    "@context": "https://schema.org" as const,
    "@type": "Event" as const,
    name: title,
    url: `${siteUrl}/e/${slug}`,
    startDate,
    endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place" as const,
      name: location,
      address: {
        "@type": "PostalAddress" as const,
        streetAddress: location,
        addressLocality: subLocation,
        postalCode,
        addressCountry: "ES",
        addressRegion: "CT",
      },
    },
    image: images,
    description,
    performer: {
      "@type": "PerformingGroup" as const,
      name: location,
    },
    organizer: {
      "@type": "Organization" as const,
      name: location,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer" as const,
      price: 0,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/e/${slug}`,
      validFrom: startDate,
    },
    isAccessibleForFree: true,
    duration,
    ...(videoObject ? { video: videoObject } : {}),
  };
};


export const generateRegionsAndTownsOptions = (): {
  label: string;
  options: Option[];
}[] => {
  let regionsOptions = generateRegionsOptions();
  regionsOptions.sort((a, b) => a.label.localeCompare(b.label));
  const townsOptions = [...CITIES_DATA.entries()]
    .map(([_, region]) => ({
      label: region.label,
      options: [...region.towns.entries()]
        .filter(([_, town]) => !town.hide)
        .sort((a, b) => a[1].label.localeCompare(b[1].label))
        .map(([townKey, town]) => ({
          value: townKey,
          label: town.label,
        })),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return [{ label: "Comarques", options: regionsOptions }, ...townsOptions];
};

export const generateRegionsOptions = (): Option[] => {
  return [...CITIES_DATA.entries()].map(([value, { label }]) => ({
    value,
    label,
  }));
};

export const getPlaceTypeAndLabel = (place: string): PlaceTypeAndLabel => {
  for (const [region, regionData] of CITIES_DATA.entries() as IterableIterator<
    [string, RegionData]
  >) {
    if (region === place) {
      return { type: "region", label: regionData.label };
    }
    for (const town of regionData.towns) {
      if (town === place) {
        return { type: "town", label: town, regionLabel: regionData.label };
      }
    }
  }
  return { type: "town", label: place };
};

export const generateTownsOptions = (region: string): Option[] => {
  const regionData = CITIES_DATA.get(region);
  if (!regionData) return [];
  return Array.from(regionData.towns.entries()).map(([townKey, townData]) => ({
    value: townKey,
    label: townData.label,
  }));
};

export const getPlaceLabel = (place: string): string => {
  for (const [region, regionData] of CITIES_DATA) {
    if (region === place) return regionData.label;
    if (Array.from(regionData.towns.keys()).includes(place)) return place;
  }
  return place;
};



export const getTownLabel = (townValue: string): string => {
  for (const [, region] of CITIES_DATA) {
    const town = region.towns.get(townValue);
    if (town) return town.label;
  }
  return "";
};

export const getRegionLabelByValue = (regionValue: string): string => {
  const region = CITIES_DATA.get(regionValue);
  return region ? region.label : "";
};

export const getTownOptionsWithoutRegion = (town: string): Option[] => {
  const options: Option[] = [];
  for (const [, region] of CITIES_DATA) {
    region.towns.forEach((townData, townKey) => {
      if (townKey === town) {
        options.push({ value: townKey, label: townData.label });
      }
    });
  }
  return options;
};

export const getRegionByTown = (town: string): string => {
  for (const [regionKey, region] of CITIES_DATA) {
    if (region.towns.has(town)) return regionKey;
  }
  return "";
};

export const getRegionValueByLabel = (regionLabel: string): string => {
  for (const [regionKey, region] of CITIES_DATA) {
    if (region.label === regionLabel) return regionKey;
  }
  return "";
};

export const getTownValueByLabel = (label: string): string | undefined => {
  for (const [, region] of CITIES_DATA.entries() as IterableIterator<
    [string, RegionData]
  >) {
    for (const town of region.towns) {
      if (town.toLowerCase() === label.toLowerCase()) {
        return town;
      }
    }
  }
  return undefined;
};

export const truncateString = (str: string, num: number): string => {
  if (str.length <= num) return str;
  return str.slice(0, num) + "...";
};

export const getDistance = (
  location1: Location,
  location2: Location
): number => {
  const R = 6371;
  const dLat = deg2rad(location2.lat - location1.lat);
  const dLon = deg2rad(location2.lng - location1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location1.lat)) *
      Math.cos(deg2rad(location2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const sendEventToGA = (
  filterName: string,
  filterValue: string
): void => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "filter_change", {
      event_category: "Filter",
      event_label: `${filterName}: ${filterValue}`,
    });
  }
};

export const env: string =
  process.env.NODE_ENV !== "production"
    ? "dev"
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
    ? "staging"
    : "prod";

export const getRegionFromQuery = (q: string): string => {
  const parts = q.split(" ");
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return "";
};

export const findCategoryKeyByValue = (value: string): string | undefined => {
  return Object.keys(CATEGORIES).find((key) => CATEGORIES[key] === value);
};
