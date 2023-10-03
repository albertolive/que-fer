import { useCallback, useEffect } from "react";
import SearchIcon from "@heroicons/react/solid/SearchIcon";

const SEARCH_TERM_KEY = "searchTerm";

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

export default function Search({ searchTerm, setSearchTerm }) {
  const searchEvents = useCallback((term) => {
    if (term && term.length > 0) {
      sendSearchTermGA(term);
    }
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      localStorage.setItem(SEARCH_TERM_KEY, JSON.stringify(searchTerm));
    }
  }, [searchTerm]);

  useEffect(() => {
    let storedTerm = localStorage.getItem(SEARCH_TERM_KEY);
    try {
      storedTerm = JSON.parse(storedTerm);
    } catch (e) {
      console.error(e);
    }

    if (storedTerm) {
      setSearchTerm(storedTerm);
      searchEvents(storedTerm);
    }
  }, [searchEvents, setSearchTerm]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        const value = e.target.value;
        sendSearchTermGA(value);
        setSearchTerm(value);
      }
    },
    [setSearchTerm]
  );

  const debouncedChangeHandler = debounce((value) => {
    if (value.length === 0) {
      setSearchTerm("");
      localStorage.setItem(SEARCH_TERM_KEY, JSON.stringify(""));
    } else {
      sendSearchTermGA(value);
      setSearchTerm(value);
    }
  }, 1500);

  const handleChangeWithDebounce = (e) => {
    debouncedChangeHandler(e.target.value);
  };

  const onFocus = (e) => {
    let val = localStorage.getItem(SEARCH_TERM_KEY);
    try {
      val = JSON.parse(val);
    } catch (e) {
      console.error(e);
    }
    e.target.value = val || e.target.value;
  };

  return (
    <div className="space-y-8 divide-y divide-gray-200 max-w-3xl mx-auto mb-4">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="relative">
          <input
            type="text"
            className="shadow-sm focus:ring-gray-300 focus:border-gray-300 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Cerca..."
            defaultValue={searchTerm}
            onKeyDown={handleKeyPress}
            onChange={handleChangeWithDebounce}
            autoFocus
            onFocus={onFocus}
          />
          <div className="absolute top-2 right-2 cursor-pointer">
            <SearchIcon
              className="h-6 w-6 text-gray-400"
              onClick={() => searchEvents(searchTerm)}
              aria-label="Search"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
