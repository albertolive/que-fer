import { MONTHS_URL as MONTHS } from "@utils/constants";
import { nextDay, isWeekend } from "@utils/helpers";

export const getDaylightSaving = () => {
  const date = new Date();
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) != date.getTimezoneOffset() ? 2 : 1;
};

export const today = () => {
  const from = new Date();
  const until = new Date();

  until.setHours(24);
  until.setMinutes(0);
  until.setSeconds(0);

  return { from, until };
};

export const tomorrow = () => {
  const from = new Date();
  from.setDate(from.getDate() + 1); // set the date to tomorrow
  const until = new Date(from.getTime()); // copy the date object

  until.setHours(24);
  until.setMinutes(0);
  until.setSeconds(0);

  return { from, until };
};

export const week = () => {
  const from = new Date();
  const until = nextDay(0);

  until.setHours(24);
  until.setMinutes(0);
  until.setSeconds(0);

  return { from, until };
};

export const weekend = () => {
  let from = nextDay(5);

  if (isWeekend()) {
    from = new Date();
  } else {
    from.setHours(6);
    from.setMinutes(0);
    from.setSeconds(0);
  }

  const until = nextDay(0);

  until.setHours(24);
  until.setMinutes(0);
  until.setSeconds(0);

  return { from, until };
};

export const twoWeeksDefault = () => {
  const now = new Date();
  const from = new Date();
  const until = new Date(now.setDate(now.getDate() + 14));

  return { from, until };
};

export const getHistoricDates = (month, year) => {
  const getMonth = MONTHS.indexOf(month);

  const from = new Date(year, getMonth, 1, 2, 0, 0);
  const until = new Date(year, getMonth + 1, 0, 24, 59, 59);

  return { from, until };
};

export const getAllYears = () => {
  const currentYear = new Date().getFullYear();

  return Array.from(
    { length: currentYear - 2023 + 1 },
    (_, i) => currentYear - i
  );
};
