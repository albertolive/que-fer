import { fetchKeywordPerformance } from "@utils/searchConsole";

/**
 * API Route Handler to Fetch Keyword Performance Data
 *
 * Expects a POST request with JSON body containing:
 * - siteUrl: string
 * - startDate: string (YYYY-MM-DD)
 * - endDate: string (YYYY-MM-DD)
 *
 * Returns:
 * - 200: JSON object with keyword data
 * - 400: Missing parameters
 * - 500: Internal server error
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { siteUrl, startDate, endDate } = req.body;

  if (!siteUrl || !startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "siteUrl, startDate, and endDate are required." });
  }

  try {
    const data = await fetchKeywordPerformance(siteUrl, startDate, endDate);
    return res.status(200).json({ rows: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
