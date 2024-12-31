import { DAYS, MONTHS, CITIES_DATA, BYDATES, CATEGORIES } from "./constants";
import { siteUrl } from "@config/index";

const isLessThanFiveDays = (date) => {
  const currentDate = new Date();
  const timeDiff = currentDate.getTime() - date.getTime();
  const dayDiff = timeDiff / (1000 * 3600 * 24);
  return Math.floor(Math.abs(dayDiff)) < 5;
};

export const sanitize = (url) => {
  const accents = [
    /[\u0300-\u030f]/g, // Combining Diacritical Marks
    /[\u1AB0-\u1AFF]/g, // Combining Diacritical Marks Extended
    /[\u1DC0-\u1DFF]/g, // Combining Diacritical Marks Supplement
    /[\u1F00-\u1FFF]/g, // Greek Extended
    /[\u2C80-\u2CFF]/g, // Coptic
    /[\uFB00-\uFB06]/g, // Alphabetic Presentation Forms (ligatures)
  ];

  let sanitizedUrl = url.toLowerCase();

  sanitizedUrl = sanitizedUrl.replace(/\s+$/, "");

  // Remove accents
  accents.forEach((regex) => {
    sanitizedUrl = sanitizedUrl.normalize("NFD").replace(regex, "");
  });

  // Replace spaces and illegal characters with hyphens
  sanitizedUrl = sanitizedUrl.replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-");

  // Replace consecutive hyphens, en-dashes, and em-dashes with a single hyphen
  sanitizedUrl = sanitizedUrl.replace(/[-\s]+/g, "-");

  return sanitizedUrl;
};

export const sanitizeText = (str) =>
  str.replace("&amp;", "&").replace(/\[Ad\]/g, "");

export const slug = (str, formattedStart, id) =>
  `${sanitize(str)}-${formattedStart
    .toLowerCase()
    .replace(/ /g, "-")
    .replace("---", "-")
    .replace("ç", "c")
    .replace(/--/g, "-")}-${id}`;

export const convertTZ = (date, tzString) =>
  new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );

function calculateDetailedDurationISO8601(start, end) {
  const differenceInMs = end - start;

  // Convert to days, hours, minutes, and seconds
  const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);

  // Build ISO 8601 duration string
  let duration = "P";
  if (days > 0) duration += `${days}D`;

  // Only add "T" if there are time components to specify
  if (hours > 0 || minutes > 0 || seconds > 0) {
    duration += "T";
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (seconds > 0) duration += `${seconds}S`;
  }

  // Handle the case where there's no difference between start and end
  if (duration === "P") {
    return "PT1H";
  }

  return duration;
}

export const getFormattedDate = (start, end) => {
  const startDate = new Date(
    (start && start.date) || (start && start.dateTime) || start
  );
  const endDate = new Date((end && end.date) || (end && end.dateTime) || end);
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

  const weekDay = new Date(startDateConverted).getDay();
  const month = new Date(startDateConverted).getMonth();
  const year = new Date(startDateConverted).getFullYear();
  const nameDay = DAYS[weekDay];
  const nameMonth = MONTHS[month];

  const originalFormattedStart = `${startDay} de ${nameMonth} del ${year}`;
  const formattedStart =
    isMultipleDays && isSameMonth
      ? `${startDay}`
      : `${startDay} de ${nameMonth} ${
          isMultipleDays && isSameYear ? "" : `del ${year}`
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

export const nextDay = (x) => {
  let now = new Date();
  now.setDate(now.getDate() + ((x + (7 - now.getDay())) % 7));
  const covertDate = convertTZ(now, "Europe/Madrid");

  return covertDate;
};

export const isWeekend = () => {
  const now = new Date();

  return now.getDay() === 0 || now.getDay() === 5 || now.getDay() === 6;
};

export const monthsName = [
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

export const generateJsonData = (event) => {
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
  const images = [imageUploaded, eventImage, defaultImage].filter(Boolean);

  const videoObject = videoUrl
    ? {
        "@type": "VideoObject",
        name: title,
        contentUrl: videoUrl,
        description,
        thumbnailUrl: imageUploaded || eventImage || defaultImage,
        uploadDate: startDate,
      }
    : null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    url: `${siteUrl}/e/${slug}`,
    startDate,
    endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
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
      "@type": "PerformingGroup",
      name: location,
    },
    organizer: {
      "@type": "Organization",
      name: location,
      url: siteUrl,
    },
    offers: {
      "@type": "Offer",
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

export function createArrayOfObjects(arr) {
  return arr.map(function (item) {
    return { value: item, label: item.charAt(0).toUpperCase() + item.slice(1) };
  });
}

export function generateRegionsAndTownsOptions() {
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
}

export function generateRegionsOptions() {
  return [...CITIES_DATA.entries()]
    .sort((a, b) => a[1].label.localeCompare(b[1].label))
    .map(([regionKey, region]) => ({
      value: regionKey,
      label: region.label,
    }));
}

export function getPlaceLabel(placeValue) {
  for (const [regionKey, region] of CITIES_DATA.entries()) {
    if (regionKey === placeValue) {
      return region.label;
    }
    for (const [townKey, town] of region.towns.entries()) {
      if (townKey === placeValue) {
        return town.label;
      }
    }
  }
  return "";
}

export function getPlaceTypeAndLabel(place) {
  const placeLabel = getPlaceLabel(place);
  if (placeLabel) {
    if (CITIES_DATA.has(place)) {
      // place is a region
      return {
        type: "region",
        label: getRegionLabelByValue(place),
        regionLabel: "",
      };
    } else {
      // place is a town
      const regionLabel = getRegionByTown(place);
      return { type: "town", label: getTownLabel(place), regionLabel };
    }
  }
  return { type: null, label: "", regionLabel: "" };
}

export function getTownLabel(townValue) {
  for (const region of CITIES_DATA.values()) {
    for (const [townKey, town] of region.towns.entries()) {
      if (townKey === townValue) {
        return town.label;
      }
    }
  }
  return "";
}

export function getTownPostalCode(townValue) {
  for (const region of CITIES_DATA.values()) {
    for (const [townKey, town] of region.towns.entries()) {
      if (townKey === townValue) {
        return town.postalCode;
      }
    }
  }
  return "";
}

export function getRegionLabelByValue(regionValue) {
  for (const [regionKey, region] of CITIES_DATA.entries()) {
    if (regionKey === regionValue) {
      return region.label;
    }
  }
  return "";
}

export function getRegionsLabel() {
  const placeNames = [];

  for (const [, regionData] of CITIES_DATA.entries()) {
    placeNames.push(regionData.label);
  }

  return placeNames;
}

export function generateTownsOptions(region) {
  const regionData = CITIES_DATA.get(region);
  return region && regionData
    ? [...regionData.towns.entries()]
        .filter(([_, town]) => !town.hide)
        .sort((a, b) => a[1].label.localeCompare(b[1].label))
        .map(([townKey, town]) => ({
          value: townKey,
          label: town.label,
        }))
    : [];
}

export function generateDatesOptions(byDate) {
  return byDate
    ? BYDATES.filter((byDateOption) => byDateOption.value === byDate)
    : [];
}

export function getByDateLabel(byDateValue) {
  const byDateObj = BYDATES.find((byDate) => byDate.value === byDateValue);
  return byDateObj ? byDateObj.label : "";
}

export function getTownOptionsWithoutRegion(town) {
  let townData = {};

  for (const [_, regionData] of CITIES_DATA.entries()) {
    if (regionData.towns.has(town)) {
      townData = regionData.towns.get(town);
      break;
    }
  }

  return townData;
}

export function getRegionByTown(town) {
  let region = "";
  for (const [key, value] of CITIES_DATA.entries()) {
    if (value.towns.has(town)) {
      region = key;
      break;
    }
  }

  return getRegionLabelByValue(region);
}

export function getTownOptionsWithLabel(label) {
  let townOptions = {};
  CITIES_DATA.forEach((region) => {
    region.towns.forEach((town) => {
      if (town.label === label) {
        townOptions = town;
      }
    });
  });

  return townOptions;
}

export function getRegionValueByLabel(regionLabel) {
  for (const [regionKey, region] of CITIES_DATA.entries()) {
    if (region.label === regionLabel) {
      return regionKey;
    }
  }
  return "";
}

export function getTownValueByLabel(townLabel) {
  for (const region of CITIES_DATA.values()) {
    for (const [townKey, town] of region.towns.entries()) {
      if (town.label === townLabel) {
        return townKey;
      }
    }
  }
  return "";
}

export function truncateString(text, maxLength) {
  return text.length > maxLength
    ? text.substring(0, maxLength - 3) + "..."
    : text;
}

export function getDistance(location1, location2) {
  var R = 6371;
  var dLat = deg2rad(location2.lat - location1.lat);
  var dLng = deg2rad(location2.lng - location1.lng);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location1.lat)) *
      Math.cos(deg2rad(location2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export const sendEventToGA = (filterName, filterValue) => {
  if (typeof window !== "undefined" && filterName && filterValue) {
    window.gtag &&
      window.gtag("event", "filter_used", {
        filter_name: filterName,
        filter_value: filterValue,
      });
  }
};

export const env =
  process.env.NODE_ENV !== "production"
    ? "dev"
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
    ? "dev"
    : "prod";

export function getRegionFromQuery(q) {
  const parts = q.split(" ");
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return "";
}

export function findCategoryKeyByValue(value) {
  return Object.keys(CATEGORIES).find((key) => CATEGORIES[key] === value);
}

export function sanitizeUrl(url) {
  if (typeof url !== "string") {
    console.warn("Invalid URL type:", typeof url);
    return "";
  }

  // Remove any leading "https," or "http,"
  url = url.replace(/^(https?),\s*/, "");

  // Ensure the URL starts with http:// or https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // Remove any double slashes (except after the protocol)
  url = url.replace(/(https?:\/\/)\/+/g, "$1");

  // Remove any spaces in the URL
  url = url.replace(/\s+/g, "");

  try {
    // Try to construct a URL object to validate the URL
    new URL(url);
    return url;
  } catch (error) {
    console.warn("Invalid URL after sanitization:", url);
    return "";
  }
}
