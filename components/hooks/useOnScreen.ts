import { useEffect, useState, useRef } from "react";

function useOnScreen(ref, options = {}) {
  const { rootMargin = "0px", freezeOnceVisible = false } = options;
  const [isIntersecting, setIntersecting] = useState(false);
  const observerRef = useRef(null);
  const frozenRef = useRef(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      console.warn("IntersectionObserver is not supported by this browser.");
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) {
      return;
    }

    const updateEntry = ([entry]) => {
      if (frozenRef.current) {
        return;
      }

      setIntersecting(entry.isIntersecting);

      if (entry.isIntersecting && freezeOnceVisible) {
        frozenRef.current = true;
      }
    };

    const observerParams = {
      rootMargin,
      ...options,
    };

    const observer = new IntersectionObserver(updateEntry, observerParams);
    observerRef.current = observer;

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin, freezeOnceVisible, options]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return isIntersecting;
}

export default useOnScreen;
