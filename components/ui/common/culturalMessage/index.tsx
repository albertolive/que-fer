import Link from "next/link";
import { useRouter } from "next/router";
import { getTownValueByLabel } from "@utils/helpers";
import { sendGoogleEvent } from "@utils/analytics";

const CulturalMessage = ({ location }) => {
  const { push } = useRouter();
  const town = getTownValueByLabel(location);

  if (!town) {
    return null;
  }

  const handleNavigation = async (e, town, timeframe) => {
    e.preventDefault();
    sendGoogleEvent("navigate_to", {
      content_type: "navigation",
      item_id: `${town}_${timeframe}`,
      item_name: `${town} ${timeframe}`,
      event_category: "Navigation",
      event_label: `navigate_to_${town}_${timeframe}`,
    });
    await push(e.target.href);
  };

  return (
    <p className="mt-2">
      Imagina un lloc on cada dia és una nova descoberta. Això és{" "}
      <span className="font-bold">{location}</span>: un univers de cultura
      esperant ser explorat per tu. Comença la teva aventura{" "}
      <Link
        href={`/${town}/avui`}
        onClick={(e) => handleNavigation(e, town, "avui")}
        className="font-medium text-primary hover:underline"
      >
        avui
      </Link>
      , descobreix què està passant{" "}
      <Link
        href={`/${town}/dema`}
        onClick={(e) => handleNavigation(e, town, "dema")}
        className="font-medium text-primary hover:underline"
      >
        demà
      </Link>
      , continua explorant{" "}
      <Link
        href={`/${town}/setmana`}
        onClick={(e) => handleNavigation(e, town, "setmana")}
        className="font-medium text-primary hover:underline"
      >
        durant la setmana
      </Link>
      , i culmina amb un{" "}
      <Link
        href={`/${town}/cap-de-setmana`}
        onClick={(e) => handleNavigation(e, town, "cap-de-setmana")}
        className="font-medium text-primary hover:underline"
      >
        cap de setmana espectacular
      </Link>
      . Deixa&apos;t sorprendre per tot el que{" "}
      <span className="font-bold">{location}</span> pot oferir-te.
    </p>
  );
};

export default CulturalMessage;
