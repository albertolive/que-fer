import Meta from "@components/partials/seo-meta";
import { siteUrl } from "@config/index";
import { generateRegionsOptions, generateTownsOptions } from "@utils/helpers";
import Link from "next/link";

const regions = generateRegionsOptions();

export default function Sitemap() {
  return (
    <>
      <Meta
        title={`Arxiu. Descobreix tot el que passa a Catalunya - Esdeveniments.cat`}
        description="Descobreix tot el què ha passat a Catalunya cada any. Les millors propostes culturals per esprémer al màxim de Catalunya - Arxiu - Esdeveniments.cat"
        canonical={`${siteUrl}/sitemap`}
      />
      <div className="w-full px-6">
        {regions.map(({ value, label }) => {
          const towns = generateTownsOptions(value);

          return (
            <div key={value} className="">
              <div className="">
                <h2 className="mb-4">{label}</h2>
              </div>
              {towns.map(({ value: valueTown, label: labelTown }) => {
                return (
                  <div key={`${valueTown}`} className="mb-2">
                    <Link
                      href={`/sitemap/${valueTown.toLowerCase()}`}
                      prefetch={false}
                      className="hover:underline"
                    >
                      <p className="">{labelTown}</p>
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
