import React, { useCallback, useMemo, memo } from "react";
import { ShareIcon } from "@heroicons/react/outline";
import useCheckMobileScreen from "@components/hooks/useCheckMobileScreen";
import { sendGoogleEvent } from "@utils/analytics";

const NativeShareButton = ({
  title,
  url,
  date,
  location,
  subLocation,
  onShareClick,
  hideText = false,
}) => {
  const isMobile = useCheckMobileScreen();

  const shareText = useMemo(
    () =>
      `
${title}

Data: ${date}
Lloc: ${location}, ${subLocation}
  `.trim(),
    [title, date, location, subLocation]
  );

  const handleNativeShare = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (onShareClick) {
        onShareClick(e);
      }

      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text: shareText,
            url,
          });
          sendGoogleEvent("share", { method: "native", content: title });
        } catch (error) {
          console.error("Error sharing:", error);
          sendGoogleEvent("share_error", {
            method: "native",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      } else {
        console.log("Native sharing not supported on this browser");
      }
    },
    [title, shareText, url, onShareClick]
  );

  if (!isMobile) {
    return null;
  }

  return (
    <button
      onClick={handleNativeShare}
      className="flex items-center text-primary hover:text-primary-dark transition-colors duration-200"
      aria-label={`Compartir ${title}`}
      title="Compartir"
    >
      <ShareIcon className="h-6 w-6" />
      {!hideText && (
        <p className="text-blackCorp ml-2 hover:underline">Compartir</p>
      )}
    </button>
  );
};

export default memo(NativeShareButton);
