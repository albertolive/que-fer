import { useState } from "react";
import dynamic from "next/dynamic";
import { monthsName, generateJsonData } from "@utils/helpers";
import { useGetEvents } from "@components/hooks/useGetEvents";
import {
  getTownLabel,
  getRegionLabel,
  fixArticles,
  addArticleToMonth,
} from "@utils/normalize";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_DOMAIN_URL;

const Events = dynamic(() => import("@components/ui/events"), {
  loading: () => "",
});

export default function Town(props) {
  const [page, setPage] = useState(() => {
    const storedPage =
      typeof window !== "undefined" &&
      window.localStorage.getItem("currentPage");
    return storedPage ? parseInt(storedPage) : 1;
  });
  const {
    data: { events = [] },
    error,
    isLoading,
    isValidating,
  } = useGetEvents({ props, pageIndex: "all", maxResults: page * 10 });

  if (error) return <div>failed to load</div>;

  const jsonEvents = events
    .filter(({ isAd }) => !isAd)
    .map((event) => generateJsonData(event));

  const { town, byDate, region, currentYear } = props;
  const townLabel = getTownLabel(town);
  const regionLabel = getRegionLabel(region);
  const canonical = `${siteUrl}/${region}/${town}`;

  const normalizedMonth = addArticleToMonth(monthsName[new Date().getMonth()]);

  const description = (
    <>
      Us donem un ventall de possibilitats perquè no us quedi temps per
      avorrir-vos. La cultura no descansa. Podeu veure què passa{" "}
      <Link href={`/${region}/${town}/avui`} prefetch={false}>
        <a className="font-medium text-black underline">avui</a>
      </Link>
      ,{" "}
      <Link href={`/${region}/${town}/setmana`} prefetch={false}>
        <a className="font-medium text-black underline">aquesta setmana</a>
      </Link>
      , o ve,{" "}
      <Link href={`/${region}/${town}cap-de-setmana`} prefetch={false}>
        <a className="font-medium text-black underline">el cap de setmana</a>
      </Link>{" "}
      a {townLabel}. Ja no teniu cap excusa, per no estar al dia, de tot el que
      passa a {townLabel} vinculat a la cultura!
    </>
  );

  return (
    <Events
      events={events}
      jsonEvents={jsonEvents}
      metaTitle={`Agenda ${townLabel} ${currentYear} - Què fer`}
      metaDescription={`Què fer és una iniciativa ciutadana per veure en un cop d'ull tots els actes culturals que es fan a ${regionLabel}. L'agenda és col·laborativa.`}
      title={`Agenda ${townLabel} ${currentYear}`}
      subTitle={`Les millors coses per fer a ${townLabel}: mercats, exposicions, descobriments, passejades, concerts, museus, teatre... Aquests són els
      millors plans per gaudir de ${townLabel} ${normalizedMonth}!`}
      description={description}
      noEventsFound={false}
      byDate={byDate}
      townLabel={townLabel}
      canonical={canonical}
      isLoading={isLoading}
      isValidating={isValidating}
      loadMore
      page={page}
      setPage={setPage}
    />
  );
}

export async function getStaticPaths() {
  const { REGIONS, TOWNS, BYDATES } = require("@utils/constants");

  const paths = REGIONS.reduce((acc, region) => {
    const townPaths = TOWNS.map((town) => {
      const datePaths = BYDATES.map((byDate) => ({
        params: {
          region: region.value,
          town: town.value,
          byDate: byDate.value,
        },
      }));
      return datePaths;
    });
    return [...acc, ...townPaths.flat()];
  }, []);

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { getCalendarEvents } = require("@lib/helpers");
  const { twoWeeksDefault } = require("@lib/dates");

  const { from, until } = twoWeeksDefault();

  const { events } = await getCalendarEvents({
    from,
    until,
  });
  const normalizedEvents = JSON.parse(JSON.stringify(events));

  return {
    props: {
      events: normalizedEvents,
      currentYear: new Date().getFullYear(),
      ...params,
    },

    revalidate: 60,
  };
}
