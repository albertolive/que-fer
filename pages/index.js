import { useEffect, useState } from "react";
import { getCategorizedEvents, getLatestEvents } from "@lib/helpers";
import { twoWeeksDefault } from "@lib/dates";
import { MAX_RESULTS, SEARCH_TERMS_SUBSET } from "@utils/constants";
import Events from "@components/ui/events";
import { initializeStore } from "@utils/initializeStore";

export default function Home({ initialState }) {
  const [keywords, setKeywords] = useState([]);

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const siteUrl = "sc-domain:esdeveniments.cat";
        const response = await fetch("/api/getKeywordPerformance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            siteUrl,
            startDate: "2024-01-01",
            endDate: "2024-12-31",
          }),
        });

        const data = await response.json();
        if (data.rows) {
          const topKeywords = data.rows.map((row) => row.keys[0]);
          setKeywords(topKeywords);
        }
      } catch (error) {
        console.error("Error fetching keyword data:", error);
      }
    };

    fetchKeywords();
  }, []);

  useEffect(() => {
    initializeStore(initialState);
  }, [initialState]);

  console.log(keywords);

  return <Events />;
}

export async function getStaticProps() {
  const { from, until } = twoWeeksDefault();

  const initialState = {};

  const [categorizedResult, latestResult] = await Promise.allSettled([
    getCategorizedEvents({
      searchTerms: SEARCH_TERMS_SUBSET,
      from,
      until,
      maxResults: MAX_RESULTS,
      filterByDate: true,
    }),
    getLatestEvents({
      from,
      until,
      maxResults: MAX_RESULTS,
      filterByDate: true,
    }),
  ]);

  initialState.categorizedEvents =
    categorizedResult.status === "fulfilled" ? categorizedResult.value : {};
  initialState.latestEvents =
    latestResult.status === "fulfilled" ? latestResult.value.events : [];

  return {
    props: {
      initialState,
    },
    revalidate: 60,
  };
}
