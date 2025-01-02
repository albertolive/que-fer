import { useState, memo, lazy } from "react";
import GoogleAdsenseContainer from "../GoogleAdsense";

const AdBoard = lazy(() => import("../adBoard"));

export default memo(function AdArticle({ isDisplay = true, slot }) {
  const [displayAd, setDisplayAd] = useState(true);

  if (!displayAd) return <AdBoard />;

  return (
    <div className="flex">
      <GoogleAdsenseContainer
        id={slot}
        slot={slot}
        format={isDisplay ? "auto" : "fluid"}
        responsive={isDisplay}
        layout={isDisplay ? "" : "in-article"}
        style={{ textAlign: isDisplay ? "initial" : "center" }}
        setDisplayAd={setDisplayAd}
      />
    </div>
  );
});
