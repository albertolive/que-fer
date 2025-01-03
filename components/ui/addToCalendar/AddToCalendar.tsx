import {
  useState,
  useCallback,
  lazy,
  Suspense,
  memo,
  useRef,
  useEffect,
} from "react";
import CalendarButton from "./CalendarButton";
import { generateCalendarUrls } from "@utils/calendarUtils";

const LazyCalendarList = lazy(() => import("./CalendarList"));

const useOutsideClick = (ref, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
};

const AddToCalendar = ({
  title,
  description,
  location,
  startDate,
  endDate,
  canonical,
  hideText = false,
}) => {
  const [showAgendaList, setShowAgendaList] = useState(false);
  const containerRef = useRef(null);

  const toggleAgendaList = useCallback(() => {
    setShowAgendaList((prev) => !prev);
  }, []);

  const calendarUrls = useCallback(
    () =>
      generateCalendarUrls({
        title,
        description,
        location,
        startDate,
        endDate,
        canonical,
      }),
    [title, description, location, startDate, endDate, canonical]
  );

  useOutsideClick(containerRef, () => setShowAgendaList(false));

  return (
    <div ref={containerRef} className="relative">
      <CalendarButton onClick={toggleAgendaList} hideText={hideText} />
      {showAgendaList && (
        <Suspense fallback={<div>Carregant...</div>}>
          <LazyCalendarList
            onClick={toggleAgendaList}
            getUrls={calendarUrls}
            title={title}
          />
        </Suspense>
      )}
    </div>
  );
};

export default memo(AddToCalendar);
