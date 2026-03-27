import { randomUUID } from "crypto";
import { getDate, getAllDates, createDate } from "../database";
import type { DateIdea } from "../database";

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


export function createDateService(input: {
  name: string;
  type: string;
  description?: string;
  location?: string;
  avg_cost?: number;
  recommended_group?: string;
  icon?: string;
  group_size?: string;
}): DateIdea {
  const date: DateIdea = {
    id: randomUUID(),
    name: input.name,
    type: input.type,
    description: input.description ?? "",
    location: input.location ?? "",
    avg_cost: input.avg_cost ?? 0,
    recommended_group: input.recommended_group ?? "",
    icon: input.icon ?? "📅",
    group_size: input.group_size ?? "",
    avg_rating: 0,
  };

  const created = createDate(date);
  if (!created) throw new Error("Failed to create date");
  return created;
}
