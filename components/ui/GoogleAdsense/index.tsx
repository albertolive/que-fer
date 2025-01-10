import { useEffect, useRef } from "react";

const GoogleAdsenseContainer = ({
  id,
  style,
  layout,
  format,
  responsive,
  slot,
  setDisplayAd,
}) => {
  const adRef = useRef(null);
  const observer = useRef(null);

  useEffect(() => {
    if (
      adRef.current &&
      adRef.current.children &&
      adRef.current.children.length > 0
    ) {
      return; // Ad already loaded in this element, return early
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.log("adsense error", err);
    }
  }, []);

  useEffect(() => {
    const callback = (mutationsList) => {
      mutationsList.forEach((element) => {
        if (element.target.attributes["data-ad-status"].value === "unfilled") {
          setDisplayAd && setDisplayAd(false);
        }
      });
    };

    if (!observer.current) {
      observer.current = new MutationObserver(callback);
    }

    if (adRef.current) {
      observer.current.observe(adRef.current, {
        attributeFilter: ["data-ad-status"],
        attributes: true,
      });
    }

    return () => observer.current.disconnect();
  }, [setDisplayAd, style, layout, format, responsive, slot]);

  return (
    <ins
      id={id}
      ref={adRef}
      className="adsbygoogle w-full"
      style={{ display: "block", position: "relative", zIndex: 0, ...style }}
      data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADS}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
      data-ad-layout={layout}
    ></ins>
  );
};

export default GoogleAdsenseContainer;
