import { JSX } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Meta from "@components/partials/seo-meta";
import { siteUrl } from "@config/index";
import { getAllYears } from "@lib/dates";
import { MONTHS_URL } from "@utils/constants";
import { getTownOptionsWithoutRegion } from "@utils/helpers";
import Link from "next/link";

interface SitemapProps {
  town: string;
  label: string;
}

interface StaticPathParams {
  town: string;
  [key: string]: string;
}

const years: number[] = getAllYears();

export default function Sitemap({ town, label }: SitemapProps): JSX.Element {
  return (
    <>
      <Meta
        title={`Arxiu. Descobreix tot el que ha passat a ${label} - Esdeveniments.cat`}
        description={`Descobreix tot el què ha passat a ${label} cada any. Les millors propostes culturals per esprémer al màxim de ${town} - Arxiu - Esdeveniments.cat`}
        canonical={`${siteUrl}/sitemap/${town}`}
      />
      <div className="flex flex-col">
        <div className="reset-this">
          <h2 className="pb-4">{label}</h2>
        </div>
        <div className="grid overflow-hidden grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-2 grid-flow-row w-auto">
          {years?.map((year) => (
            <div key={year} className="box">
              <div className="reset-this">
                <h2 className="pb-2">{year}</h2>
              </div>
              {MONTHS_URL.map((month) => {
                let textMonth: string = month;
                if (month === "marc") textMonth = month.replace("c", "ç");
                return (
                  <div key={`${year}-${month}`} className="box py-1">
                    <Link
                      href={`/sitemap/${town}/${year}/${month.toLocaleLowerCase()}`}
                      prefetch={false}
                      className="hover:underline"
                    >
                      <p className="text-md capitalize">{textMonth}</p>
                    </Link>
                  </div>
                );
              }).reverse()}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths<StaticPathParams> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<
  SitemapProps,
  StaticPathParams
> = async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const { town } = params;
  if (!town) {
    return {
      notFound: true,
    };
  }

  const townOptions = getTownOptionsWithoutRegion(town);
  const label = townOptions?.[0]?.label;

  if (!label) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      town,
      label,
    },
  };
};
