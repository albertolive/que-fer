import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import ChevronLeftIcon from "@heroicons/react/solid/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/solid/ChevronRightIcon";
import format from "date-fns/format";
import ca from "date-fns/locale/ca";
import setHours from "date-fns/setHours";
import setMinutes from "date-fns/setMinutes";

import "react-datepicker/dist/react-datepicker.css";

export default function DatePickerComponent({
  startDate: initialStartDate,
  endDate: initialEndDate,
  onChange,
}) {
  const startingDate = initialStartDate
    ? new Date(initialStartDate)
    : setHours(setMinutes(new Date(), 0), 9);
  const endingDate = initialEndDate
    ? new Date(initialEndDate)
    : setMinutes(new Date(startingDate), 60);

  const [startDate, setStartDate] = useState(startingDate);
  const [endDate, setEndDate] = useState(endingDate);

  useEffect(() => {
    if (startDate > endDate) setEndDate(setMinutes(startDate, 60));
  }, [startDate, endDate]);

  const onChangeStart = (date) => {
    onChange("startDate", date);
    setStartDate(date);
    setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
  };

  const onChangeEnd = (date) => {
    onChange("endDate", date);
    setEndDate(date);
  };

  return (
    <>
      <div className="w-full">
        <label htmlFor="start-date" className="w-full text-blackCorp font-bold">
          Inici *
        </label>
        <div className="w-full mt-2">
          <DateComponent
            selected={startDate}
            onChange={onChangeStart}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="w-full rounded-xl border-bColor focus:border-darkCorp"
          />
        </div>
      </div>
      <div className="w-full">
        <label htmlFor="end-date" className="w-full text-blackCorp font-bold">
          Final *
        </label>
        <div className="w-full mt-2">
          <DateComponent
            selected={endDate}
            onChange={onChangeEnd}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="w-full rounded-xl border-bColor focus:border-darkCorp"
          />
        </div>
      </div>
    </>
  );
}

const DateComponent = ({
  selected,
  startDate,
  endDate,
  onChange,
  selectsStart,
  selectsEnd,
  minDate,
}) => {
  return (
    <DatePicker
      locale={ca}
      selected={selected}
      onChange={onChange}
      showTimeSelect
      selectsStart={!!selectsStart}
      selectsEnd={!!selectsEnd}
      startDate={startDate}
      endDate={endDate}
      minDate={minDate}
      nextMonthButtonLabel=">"
      previousMonthButtonLabel="<"
      popperClassName="react-datepicker-left"
      popperPlacement="top-end"
      dateFormat="d MMMM, yyyy HH:mm aa"
      customInput={<ButtonInput />}
      renderCustomHeader={({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className="flex justify-center items-center p-2">
          <span className="w-1/2 text-blackCorp uppercase">
            {format(date, "MMMM yyyy", { locale: ca })}
          </span>

          <div className="w-1/2 flex justify-evenly">
            <button
              onClick={decreaseMonth}
              disabled={prevMonthButtonDisabled}
              type="button"
              className={`${
                prevMonthButtonDisabled && "cursor-not-allowed opacity-50"
              }flex p-1 text-blackCorp bg-whiteCorp border border-darkCorp rounded-xl focus:outline-none`}
            >
              <ChevronLeftIcon className="w-5 h-5 text-blackCorp" />
            </button>

            <button
              onClick={increaseMonth}
              disabled={nextMonthButtonDisabled}
              type="button"
              className={`${
                nextMonthButtonDisabled && "cursor-not-allowed opacity-50"
              }flex p-1 text-blackCorp bg-whiteCorp border border-darkCorp rounded-xl focus:outline-none`}
            >
              <ChevronRightIcon className="w-5 h-5 text-blackCorp" />
            </button>
          </div>
        </div>
      )}
    />
  );
};

const ButtonInput = forwardRef(({ value, onClick }, ref) => {
  return (
    <button
      onClick={onClick}
      ref={ref}
      type="button"
      className="w-full p-2.5 border border-bColor rounded-xl text-blackCorp
      sm:text-sm"
    >
      {value}
    </button>
  );
});

ButtonInput.displayName = "ButtonInput";
