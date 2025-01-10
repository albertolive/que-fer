import { useCallback, useEffect, useMemo, useState } from "react";
import XIcon from "@heroicons/react/solid/XIcon";
import SearchIcon from "@heroicons/react/solid/SearchIcon";
import useStore from "@store";

function debounce(func, wait, immediate) {
  let timeout;

  return function executedFunction() {
    const context = this;
    const args = arguments;

    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

const sendSearchTermGA = (searchTerm) => {
  if (typeof window !== "undefined") {
    window.gtag &&
      window.gtag("event", "search", {
        event_category: "search",
        event_label: searchTerm,
        search_term: searchTerm,
        value: searchTerm,
      });
  }
};

export default function Search() {
  const { searchTerm, setState } = useStore((state) => ({
    searchTerm: state.searchTerm,
    setState: state.setState,
  }));
  const [inputValue, setInputValue] = useState(searchTerm);

  const searchEvents = useCallback((term) => {
    if (term && term.length > 0) {
      sendSearchTermGA(term);
    }
  }, []);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const debouncedChangeHandler = useMemo(
    () =>
      debounce((value) => {
        setState("searchTerm", value);
        sendSearchTermGA(value);
      }, 1500),
    [setState]
  );

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedChangeHandler(value);
    },
    [debouncedChangeHandler]
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const value = e.target.value;
        sendSearchTermGA(value);
        setState("searchTerm", value);
      }
    },
    [setState]
  );

  const clearSearchTerm = useCallback(() => {
    setState("searchTerm", "");
    setInputValue("");
  }, [setState]);

  return (
    <div className="w-full flex justify-center border border-bColor border-opacity-50 rounded-full px-4 mt-2">
      <div className="w-full flex justify-start items-center gap-2 rounded-full">
        <div className="h-10 flex justify-end items-center cursor-pointer">
          <SearchIcon
            className="h-5 w-5 text-blackCorp"
            onClick={() => searchEvents(searchTerm)}
            aria-label="Search"
          />
        </div>
        <input
          type="text"
          className="w-full border-0 placeholder:text-bColor text-[16px] rounded-tr-full rounded-br-full"
          placeholder="Què estàs buscant?"
          value={inputValue}
          onKeyDown={handleKeyPress}
          onChange={handleChange}
          autoComplete="off"
        />
        {inputValue.length > 0 && (
          <div className="flex justify-end items-center cursor-pointer">
            <XIcon
              className="h-4 w-4 text-blackCorp"
              onClick={clearSearchTerm}
            />
          </div>
        )}
      </div>
    </div>
  );
}
