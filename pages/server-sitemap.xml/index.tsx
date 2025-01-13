import { getServerSideSitemap } from "next-sitemap";

import { sanitize } from "@utils/helpers";
import { siteUrl } from "@config/index";

export const getServerSideProps = async (ctx) => {
  const { getCalendarEvents } = require("@lib/helpers");

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 4);
  const until = new Date(now.getFullYear(), now.getMonth() + 4);

  const { events } = await getCalendarEvents({
    from,
    until,
    normalizeRss: true,
    maxResults: 2500,
    filterByDate: false,
  });
  const normalizedEvents = JSON.parse(JSON.stringify(events));

  const fields = normalizedEvents
    ?.filter((event) => !event.isAd)
    .map((data) => {
      let field = {
        loc: `${siteUrl}/e/${data.slug}`,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
      };
      const defaultImage = `${siteUrl}/static/images/logo-seo-meta.webp`;
      const image = data.imageUploaded || data.eventImage || defaultImage;

      if (image) {
        field["image:image"] = `
          <image:loc>${image}</image:loc>
          <image:title>${sanitize(data.title)}</image:title>
        `;
      }

      return field;
    });

  return getServerSideSitemap(ctx, fields);
};

export default function Site() {}
