import { FC } from "react";
import { siteUrl } from "@config/index";
import { Feed } from "feed";
import { getCalendarEvents } from "@lib/helpers";
import { getPlaceTypeAndLabel } from "@utils/helpers";
import { captureException } from "@sentry/nextjs";
import type { GetServerSideProps } from "next";
import { Event as EventType } from "@store";

const SITE_NAME = "Esdeveniments.cat";

interface Event extends EventType {
  nameDay: string;
  formattedStart: string;
  location: string;
  town: string;
  region: string;
  mapsLocation?: string;
  imageUploaded?: string;
  eventImage?: string;
  slug: string;
  startDate: string;
}

interface QueryParams {
  region?: string;
  town?: string;
  maxEventsPerDay?: string;
  until?: number;
}


const getAllArticles = async (
  region: string,
  town: string,
  maxEventsPerDay: string | undefined = undefined,
  untilProp: number = 7
): Promise<Event[]> => {
  const { label: regionLabel } = getPlaceTypeAndLabel(region);
  const { label: townLabel } = getPlaceTypeAndLabel(town);

  try {
    const now = new Date();
    const from = new Date();
    const until = new Date(now.setDate(now.getDate() + Number(untilProp)));

    const q = town ? `${townLabel} ${regionLabel}` : regionLabel;

    const { events } = await getCalendarEvents({
      from,
      until,
      q,
      normalizeRss: true,
      filterByDate: true,
      maxResults: 1000,
    });

    const shuffledEvents = events as Event[];

    // Get the last event
    const lastEvent = shuffledEvents[shuffledEvents.length - 1];

    // Limit the number of events
    const limitedEvents = maxEventsPerDay ? shuffledEvents.slice(0, Number(maxEventsPerDay)) : shuffledEvents;

    // Add the last event to the limited events
    if (lastEvent) {
      limitedEvents.push(lastEvent);
    }

    return JSON.parse(JSON.stringify(limitedEvents));
  } catch (error) {
    console.error(error);
    captureException(
      `Error getting all articles to generate the RSS feed for ${
        townLabel || regionLabel || "Catalunya"
      }: ${error}`
    );
    return [];
  }
};

const buildFeed = (items: Event[], region: string, town: string): Feed => {
  const defaultImage = `${siteUrl}/static/images/logo-seo-meta.webp`;
  const { label: regionLabel } = getPlaceTypeAndLabel(region);
  const { label: townLabel } = getPlaceTypeAndLabel(town);

  const feed = new Feed({
    id: siteUrl,
    link: siteUrl,
    title: `Rss ${SITE_NAME} - ${townLabel || regionLabel || "Catalunya"}`,
    description: `Rss ${SITE_NAME} de ${
      townLabel || regionLabel || "Catalunya"
    }`,
    copyright: SITE_NAME,
    updated: new Date(),
    author: {
      name: SITE_NAME,
      link: siteUrl,
    },
  });

  const removedDuplicatedItems = items
    .filter((event) => !event.isAd)
    .filter(
      (v, i, a) =>
        a.findIndex((v2) => v2.id.split("_")[0] === v.id.split("_")[0]) === i
    );

  removedDuplicatedItems.forEach((item) => {
    const description = `${item.title}\n\n🗓️ ${item.nameDay} ${item.formattedStart}\n\n🏡 ${item.location}, ${item.town}, ${item.region} \n\nℹ️ Més informació disponible a la nostra pàgina web!`;

    feed.addItem({
      id: item.id,
      title: item.title,
      link: `${siteUrl}/e/${item.slug}`,
      description,
      content: item.location,
      date: new Date(item.startDate),
      image: item.imageUploaded || item.eventImage || defaultImage,
    });
  });

  return feed;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context && context.res) {
    const { res, query } = context;
    const { region = "", town = "", maxEventsPerDay, until } = query as QueryParams;

    const articles = await getAllArticles(region, town, maxEventsPerDay, until);

    const feed = buildFeed(articles, region, town);
    res.setHeader("content-type", "text/xml");
    res.write(feed.rss2()); // NOTE: You can also use feed.atom1() or feed.json1() for other feed formats
    res.end();
  }

  return {
    props: {},
  };
};

const RssPage: FC = () => null;

export default RssPage;
