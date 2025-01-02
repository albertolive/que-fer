import { useState, useEffect, useCallback } from "react";

export const useScrollVisibility = (scrollThreshold) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return window.scrollY < scrollThreshold;
    }
    return true;
  });

  const handleScroll = useCallback(() => {
    const shouldShow = window.scrollY < scrollThreshold;
    if (shouldShow !== isVisible) {
      setIsVisible(shouldShow);
    }
  }, [isVisible, scrollThreshold]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);

      // Call the handleScroll function immediately to check the initial scroll position
      handleScroll();

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return isVisible;
};
