import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase project URL and anon key
declare const process: any;
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// USERS CRUD
export async function getUser(id: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createUser(user: {
  id: string;
  email: string;
  favorites?: string[];
}) {
  const { data, error } = await supabase.from("users").insert([user]).single();
  if (error) throw error;
  return data;
}

export async function updateUser(
  id: string,
  updates: Partial<{ email: string; favorites: string[] }>,
) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id: string) {
  const { data, error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
  return data;
}

// DATES CRUD
export async function getDate(id: string) {
  const { data, error } = await supabase
    .from("dates")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getAllDates() {
  const { data, error } = await supabase.from("dates").select("*");
  if (error) throw error;
  return data;
}

export async function createDate(date: any) {
  const { data, error } = await supabase.from("dates").insert([date]).single();
  if (error) throw error;
  return data;
}

export async function updateDate(id: string, updates: any) {
  const { data, error } = await supabase
    .from("dates")
    .update(updates)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDate(id: string) {
  const { data, error } = await supabase.from("dates").delete().eq("id", id);
  if (error) throw error;
  return data;
}

// RATINGS CRUD
export async function getRating(id: string) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createRating(rating: any) {
  const { data, error } = await supabase
    .from("ratings")
    .insert([rating])
    .single();
  if (error) throw error;
  return data;
}

export async function updateRating(id: string, updates: any) {
  const { data, error } = await supabase
    .from("ratings")
    .update(updates)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRating(id: string) {
  const { data, error } = await supabase.from("ratings").delete().eq("id", id);
  if (error) throw error;
  return data;
}
