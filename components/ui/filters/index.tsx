import { memo, useCallback } from "react";
import XIcon from "@heroicons/react/solid/XIcon";
import ChevronDownIcon from "@heroicons/react/solid/ChevronDownIcon";
import AdjustmentsIcon from "@heroicons/react/outline/AdjustmentsIcon";
import { BYDATES } from "@utils/constants";
import { getPlaceLabel, findCategoryKeyByValue } from "@utils/helpers";
import { useRouter } from "next/router";
import useStore from "@store";

const renderButton = ({
  text,
  enabled,
  onClick,
  handleOpenModal,
  scrollToTop,
}) => (
  <div
    key={text}
    className="w-full bg-whiteCorp flex justify-center items-center nowrap"
  >
    <div
      className={`w-full flex justify-center items-center gap-1 px-1 ease-in-out duration-300 focus:outline-none font-medium ${
        enabled
          ? "text-primary"
          : "border-whiteCorp text-blackCorp hover:bg-darkCorp hover:text-blackCorp"
      }`}
    >
      <span
        onClick={handleOpenModal}
        className="w-full text-center font-barlow uppercase text-[16px]"
      >
        {text}
      </span>
      {enabled ? (
        <XIcon
          className="h-5 w-5"
          aria-hidden="true"
          onClick={() => {
            onClick();
            scrollToTop();
          }}
        />
      ) : (
        <ChevronDownIcon
          className="h-5 w-5"
          aria-hidden="true"
          onClick={onClick}
        />
      )}
    </div>
  </div>
);

const Filters = () => {
  const router = useRouter();
  const { place, byDate, category, distance, openModal, setState } = useStore(
    (state) => ({
      place: state.place,
      byDate: state.byDate,
      category: state.category,
      distance: state.distance,
      openModal: state.openModal,
      setState: state.setState,
    })
  );

  const isAnyFilterSelected = () => place || byDate || category || distance;
  const getText = (value, defaultValue) => (value ? value : defaultValue);
  const foundByDate = BYDATES.find((item) => item.value === byDate);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleByDateClick = useCallback(() => {
    if (byDate) {
      setState("byDate", "");
    } else {
      setState("openModal", true);
    }
  }, [byDate, setState]);

  const handleCategoryClick = useCallback(() => {
    setState("category", "");
  }, [setState]);

  const handleDistanceClick = useCallback(() => {
    setState("distance", "");
  }, [setState]);

  const handleOnClick = useCallback(
    (value, fn) => () => value ? fn() : setState("openModal", true),
    [setState]
  );

  const handlePlaceClick = useCallback(() => {
    if (place) {
      setState("place", "");

      if (place) {
        router.push(`/`);
      }
    } else {
      setState("openModal", true);
    }
  }, [place, setState, router]);

  return (
    <div
      className={`w-full bg-whiteCorp flex justify-center items-center mt-2 ${
        openModal ? "opacity-50 animate-pulse pointer-events-none" : ""
      }`}
    >
      <div className="w-full h-10 flex justify-start items-center cursor-pointer">
        <div
          onClick={() => setState("openModal", true)}
          type="button"
          className="mr-3 flex justify-center items-center gap-3 cursor-pointer"
        >
          <AdjustmentsIcon
            className={
              isAnyFilterSelected()
                ? "w-5 h-5 text-primary"
                : "w-5 h-5 text-blackCorp"
            }
            aria-hidden="true"
          />
          <p className="hidden md:block uppercase italic font-semibold font-barlow text-[16px]">
            Filtres
          </p>
        </div>
        <div className="w-8/10 flex items-center gap-1 border-0 placeholder:text-bColor overflow-x-auto">
          {renderButton({
            text: getText(getPlaceLabel(place), "Població"),
            enabled: place,
            onClick: handlePlaceClick,
            handleOpenModal: () => setState("openModal", true),
            scrollToTop,
          })}
          {renderButton({
            text: getText(
              category ? findCategoryKeyByValue(category) : category,
              "Categoria"
            ),
            enabled: category,
            onClick: handleOnClick(category, handleCategoryClick),
            handleOpenModal: () => setState("openModal", true),
            scrollToTop,
          })}
          {renderButton({
            text: getText(foundByDate?.label, "Data"),
            enabled: foundByDate,
            onClick: handleOnClick(foundByDate, handleByDateClick),
            handleOpenModal: () => setState("openModal", true),
            scrollToTop,
          })}
          {renderButton({
            text: getText(distance ? `${distance} km` : null, "Distància"),
            enabled: distance,
            onClick: handleOnClick(distance, handleDistanceClick),
            handleOpenModal: () => setState("openModal", true),
            scrollToTop,
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(Filters);
