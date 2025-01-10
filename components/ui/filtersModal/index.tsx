import { useMemo, useState, useCallback, useEffect, memo } from "react";
import dynamic from "next/dynamic";
import RadioInput from "@components/ui/common/form/radioInput";
import RangeInput from "@components/ui/common/form/rangeInput";
import { BYDATES, CATEGORY_NAMES_MAP, DISTANCES } from "@utils/constants";
import { generateRegionsAndTownsOptions, sendEventToGA } from "@utils/helpers";
import useStore from "@store";

const Modal = dynamic(() => import("@components/ui/common/modal"), {
  loading: () => "",
});

const Select = dynamic(() => import("@components/ui/common/form/select"), {
  loading: () => "",
});

function FiltersModal() {
  const {
    openModal,
    place,
    byDate,
    category,
    distance,
    userLocation,
    setState,
  } = useStore((state) => ({
    openModal: state.openModal,
    place: state.place,
    byDate: state.byDate,
    category: state.category,
    distance: state.distance,
    userLocation: state.userLocation,
    setState: state.setState,
  }));
  const [localPlace, setLocalPlace] = useState(place);
  const [localByDate, setLocalByDate] = useState(byDate);
  const [localCategory, setLocalCategory] = useState(category);
  const [localDistance, setLocalDistance] = useState(distance);
  const [localUserLocation, setLocalUserLocation] = useState(userLocation);
  const [userLocationLoading, setUserLocationLoading] = useState(false);
  const [userLocationError, setUserLocationError] = useState("");

  const regionsAndCitiesArray = useMemo(
    () => generateRegionsAndTownsOptions(),
    []
  );
  const [selectOption, setSelectOption] = useState(null);

  useEffect(() => {
    if (openModal) {
      setLocalPlace(place);
      setLocalByDate(byDate);
      setLocalCategory(category);
      setLocalDistance(distance);
      setLocalUserLocation(userLocation);
      const regionOption = regionsAndCitiesArray
        .flatMap((group) => group.options)
        .find((option) => option.value === place);
      setSelectOption(regionOption || null);
    }
  }, [
    openModal,
    place,
    byDate,
    category,
    distance,
    userLocation,
    regionsAndCitiesArray,
  ]);

  const handlePlaceChange = useCallback(
    ({ value }) => {
      const regionOption = regionsAndCitiesArray
        .flatMap((group) => group.options)
        .find((option) => option.value === value);
      setLocalPlace(value || "");
      setSelectOption(regionOption || null);
    },
    [regionsAndCitiesArray]
  );

  const handleUserLocation = useCallback(
    (value) => {
      if (localUserLocation) {
        setLocalDistance(value);
        return;
      }

      setUserLocationLoading(true);
      setUserLocationError(null);

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          function (position) {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            setLocalUserLocation(location);
            setUserLocationLoading(false);
            setLocalDistance(value);
          },
          function (error) {
            console.log("Error occurred. Error code: " + error.code);
            switch (error.code) {
              case 1:
                setUserLocationError(
                  "Permission denied. The user has denied the request for geolocation."
                );
                break;
              case 2:
                setUserLocationError(
                  "Position unavailable. Location information is unavailable."
                );
                break;
              case 3:
                setUserLocationError(
                  "Timeout. The request to get user location timed out."
                );
                break;
              default:
                setUserLocationError("An unknown error occurred.");
            }
            setUserLocationLoading(false);
          }
        );
      } else {
        console.log("Geolocation is not supported by this browser.");
        setUserLocationError("Geolocation is not supported by this browser.");
        setUserLocationLoading(false);
      }
    },
    [localUserLocation]
  );

  const handleDistanceChange = useCallback(
    (event) => {
      handleUserLocation(event.target.value);
    },
    [handleUserLocation]
  );

  const disablePlace =
    localDistance === undefined ||
    localDistance !== "" ||
    Number.isNaN(Number(localDistance));
  const disableDistance =
    localPlace || userLocationLoading || userLocationError;

  const applyFilters = () => {
    setState("place", localPlace);
    setState("byDate", localByDate);
    setState("category", localCategory);
    setState("distance", localDistance);
    setState("userLocation", localUserLocation);
    setState("filtersApplied", true);

    sendEventToGA("Place", localPlace);
    sendEventToGA("ByDate", localByDate);
    sendEventToGA("Category", localCategory);
    sendEventToGA("Distance", localDistance);

    if (!localPlace) {
      setState("place", "");
    }

    setState("openModal", false);
  };

  const handleByDateChange = useCallback((value) => {
    setLocalByDate((prevValue) => (prevValue === value ? "" : value));
  }, []);

  const handleCategoryChange = useCallback((value) => {
    setLocalCategory((prevValue) => (prevValue === value ? "" : value));
  }, []);

  return (
    <>
      <Modal
        open={openModal}
        setOpen={(value) => setState("openModal", value)}
        title="Filtres"
        actionButton="Aplicar filtres"
        onActionButtonClick={applyFilters}
      >
        <div className="w-full h-full flex flex-col justify-center items-center gap-5 py-8">
          <div className="w-full flex flex-col justify-center items-center gap-4">
            <p className="w-full font-semibold font-barlow uppercase pt-[5px]">
              Poblacions
            </p>
            <div className="w-full flex flex-col px-0">
              <Select
                id="options"
                options={regionsAndCitiesArray}
                value={selectOption}
                onChange={handlePlaceChange}
                isClearable
                placeholder="població"
                isDisabled={disablePlace}
              />
            </div>
          </div>
          <fieldset className="w-full flex flex-col justify-start items-start gap-4">
            <p className="w-full font-semibold font-barlow uppercase">
              Categories
            </p>
            <div className="w-full h-28 flex flex-col justify-start items-start gap-2 flex-wrap">
              {Object.entries(CATEGORY_NAMES_MAP).map(([key, value]) => (
                <RadioInput
                  key={key}
                  id={key}
                  name="category"
                  value={key}
                  checkedValue={localCategory}
                  onChange={handleCategoryChange}
                  label={value}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="w-full flex flex-col justify-start items-start gap-6">
            <p className="w-full font-semibold font-barlow uppercase pt-[5px]">
              Data
            </p>
            <div className="w-full flex flex-col justify-start items-start gap-x-3 gap-y-3 flex-wrap">
              {BYDATES.map(({ value, label }) => (
                <RadioInput
                  key={value}
                  id={value}
                  name="byDate"
                  value={value}
                  checkedValue={localByDate}
                  onChange={handleByDateChange}
                  label={label}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="w-full flex flex-col justify-start items-start gap-6">
            <p className="w-full font-semibold font-barlow uppercase pt-[5px]">
              Distància
            </p>
            {(userLocationLoading || userLocationError) && (
              <div className="border-t border-bColor py-2">
                <div className="flex flex-col">
                  {userLocationLoading && (
                    <div className="text-sm text-bColor">
                      Carregant localització...
                    </div>
                  )}
                  {userLocationError && (
                    <div className="text-sm text-primary">
                      {userLocationError}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div
              className={`w-full flex flex-col justify-start items-start gap-3px-0 ${
                disableDistance ? "opacity-30" : ""
              }`}
            >
              <RangeInput
                key="distance"
                id="distance"
                name="distance"
                min={DISTANCES[0]}
                max={DISTANCES[DISTANCES.length - 1]}
                value={localDistance}
                onChange={handleDistanceChange}
                label="Esdeveniments a"
                disabled={disableDistance}
              />
            </div>
          </fieldset>
        </div>
      </Modal>
    </>
  );
}

export default memo(FiltersModal);
