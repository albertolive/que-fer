import { memo } from "react";
import { PlusIcon } from "@heroicons/react/outline";

const CalendarButton = ({ onClick, hideText = false }) => (
  <button
    onClick={onClick}
    type="button"
    className="btn text-white flex items-center justify-center hover:text-primary"
  >
    <div className="bg-white p-1 mr-2 border border-black rounded ">
      <PlusIcon className="w-4 h-4" />
    </div>
    {!hideText && "Afegir al calendari"}
  </button>
);

export default memo(CalendarButton);
