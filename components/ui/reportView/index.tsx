import { useEffect } from "react";
import { env } from "@utils/helpers";

interface ReportViewProps {
  slug: string;
}

const ReportView: React.FC<ReportViewProps> = ({ slug }) => {
  useEffect(() => {
    if (env === "prod") {
      fetch("/api/reportView", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });
    }
  }, [slug]);

  return null;
};

export default ReportView;
