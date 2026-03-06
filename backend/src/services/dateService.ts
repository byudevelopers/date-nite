import { getDate, getAllDates } from "../database";

// get date by id
export function fetchDateById(id: string) {
  return getDate(id);
}

// get all dates
export function fetchAllDates() {
  return getAllDates();
}

// return all dates
export function getDateService() {
  const dates = fetchAllDates();
  return dates;
}

// function for setfavoriteda
