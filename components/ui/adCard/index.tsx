import { useState, memo, lazy } from "react";
import GoogleAdsenseContainer from "../GoogleAdsense";
import CardLoading from "@components/ui/cardLoading";

const AdBoard = lazy(() => import("../adBoard"));

const AdContent = ({ children }) => (
  <>
    <div className="w-full flex flex-col justify-center bg-whiteCorp overflow-hidden cursor-pointer mb-2 md:border-t-0">
      <div className="bg-whiteCorp h-fit flex items-start gap-2 pr-4">
        <div className="flex justify-start items-center gap-0 pt-[2px] m-0">
          <div className="w-2 h-6 bg-gradient-to-r from-primary to-primarydark"></div>
        </div>
        <h3 className="w-11/12 uppercase">Contingut patrocinat</h3>
      </div>
    </div>
    <div className="p-2 flex justify-center items-center">{children}</div>
  </>
);

export default memo(function AdCard({ event }) {
  const [displayAd, setDisplayAd] = useState(true);

  if (displayAd === undefined) return <CardLoading />;

  if (!displayAd)
    return (
      <AdContent>
        <AdBoard />
      </AdContent>
    );

  return (
    <AdContent eventId={event.id}>
      <GoogleAdsenseContainer
        id="ad-card-slot"
        slot="9209662295"
        responsive
        setDisplayAd={setDisplayAd}
      />
    </AdContent>
  );
});
