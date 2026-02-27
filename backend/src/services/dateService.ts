import { supabase, getDate, getAllDates } from "../database";

// get date by id
export async function fetchDateById(id: string) {
  return await getDate(id);
}

// get all dates
export async function fetchAllDates() {
  return await getAllDates();
}

// return all dates
export async function getDateService() {
  const dates = fetchAllDates();
  return dates;
}

// function for setfavoriteda
