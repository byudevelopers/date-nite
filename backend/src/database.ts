import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../date-nite.db"));

/* =====================================================
   TYPES
===================================================== */

export interface User {
  id: string;
  email: string;
  favorites: string[];
  password_hash: string;
}

export interface DateIdea {
  id: string;
  type: string;
  name: string;
  location: string;
  avg_cost: number;
  recommended_group: string;
  avg_rating: number;
  group_size: string;
  icon: string;
  description: string;
  google_place_id: string | null;
}

export interface Rating {
  id: string;
  user_id: string;
  date_id: string;
  romance_level: string;
  group_size: string;
  cost: number;
  good_bad: string;
  first_date: number; // 0 or 1
  created_at: string; // ISO 8601 date string
}

/* =====================================================
   TABLE SETUP
===================================================== */

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  favorites TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS dates (
  id TEXT PRIMARY KEY,
  type TEXT,
  name TEXT,
  location TEXT,
  avg_cost REAL,
  recommended_group TEXT,
  avg_rating REAL,
  group_size TEXT,
  icon TEXT,
  description TEXT,
  google_place_id TEXT
);

CREATE TABLE IF NOT EXISTS ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date_id TEXT,
  romance_level TEXT,
  group_size TEXT,
  cost REAL,
  good_bad TEXT,
  first_date INTEGER,
  created_at TEXT NOT NULL
);
`);

/* =====================================================
   USERS (WITH AUTH SUPPORT)
===================================================== */

type DBUser = {
  id: string;
  email: string;
  favorites: string;
  password_hash: string;
};

function normalizeUser(row: DBUser): User {
  return {
    id: row.id,
    email: row.email,
    favorites: row.favorites ? JSON.parse(row.favorites) : [],
    password_hash: row.password_hash,
  };
}

export function getUser(id: string): User | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | DBUser
    | undefined;

  if (!row) return null;
  return normalizeUser(row);
}

export function getUserByEmail(email: string): User | null {
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | DBUser
    | undefined;

  if (!row) return null;
  return normalizeUser(row);
}

/**
 * Create user (expects ALREADY HASHED password)
 */
export function createUser(user: {
  id: string;
  email: string;
  password_hash: string;
  favorites?: string[];
}): User | null {
  db.prepare(
    "INSERT INTO users (id, email, favorites, password_hash) VALUES (?, ?, ?, ?)",
  ).run(
    user.id,
    user.email,
    JSON.stringify(user.favorites ?? []),
    user.password_hash,
  );

  return getUser(user.id);
}

export function updateUser(
  id: string,
  updates: Partial<{
    email: string;
    favorites: string[];
    password_hash: string;
  }>,
): User | null {
  const existing = getUser(id);
  if (!existing) throw new Error("User not found");

  const email = updates.email ?? existing.email;
  const favorites = updates.favorites ?? existing.favorites;
  const password_hash = updates.password_hash ?? existing.password_hash;

  db.prepare(
    "UPDATE users SET email = ?, favorites = ?, password_hash = ? WHERE id = ?",
  ).run(email, JSON.stringify(favorites), password_hash, id);

  return getUser(id);
}

export function deleteUser(id: string): boolean {
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
  return true;
}

/* =====================================================
   DATES
===================================================== */

export function getDate(id: string): DateIdea | null {
  const row = db.prepare("SELECT * FROM dates WHERE id = ?").get(id);
  return (row as DateIdea) ?? null;
}

export function getAllDates(): DateIdea[] {
  return db.prepare("SELECT * FROM dates").all() as DateIdea[];
}

export interface DateIdeaWithStats extends DateIdea {
  rating_count: number;
  percent_recommended: number;
  latest_rating_at: string | null;
  first_date_count: number;
}

export function getAllDatesWithStats(): DateIdeaWithStats[] {
  return db.prepare(`
    SELECT
      d.*,
      COALESCE(r.rating_count, 0)        AS rating_count,
      COALESCE(r.percent_recommended, 0) AS percent_recommended,
      r.latest_rating_at,
      COALESCE(r.first_date_count, 0)    AS first_date_count
    FROM dates d
    LEFT JOIN (
      SELECT
        date_id,
        COUNT(*)                                                             AS rating_count,
        ROUND(SUM(CASE WHEN good_bad = 'good' THEN 1.0 ELSE 0 END)
              * 100.0 / COUNT(*))                                           AS percent_recommended,
        MAX(created_at)                                                      AS latest_rating_at,
        SUM(first_date)                                                      AS first_date_count
      FROM ratings
      GROUP BY date_id
    ) r ON d.id = r.date_id
  `).all() as DateIdeaWithStats[];
}

export function createDate(date: DateIdea): DateIdea | null {
  db.prepare(
    `
    INSERT INTO dates (
      id, type, name, location, avg_cost,
      recommended_group, avg_rating,
      group_size, icon, description, google_place_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    date.id,
    date.type,
    date.name,
    date.location,
    date.avg_cost,
    date.recommended_group,
    date.avg_rating,
    date.group_size,
    date.icon,
    date.description,
    date.google_place_id,
  );

  return getDate(date.id);
}

export function updateDate(
  id: string,
  updates: Partial<DateIdea>,
): DateIdea | null {
  const existing = getDate(id);
  if (!existing) throw new Error("Date not found");

  db.prepare(
    `
    UPDATE dates SET
      type = ?, name = ?, location = ?, avg_cost = ?,
      recommended_group = ?, avg_rating = ?, group_size = ?,
      icon = ?, description = ?, google_place_id = ?
    WHERE id = ?
  `,
  ).run(
    updates.type ?? existing.type,
    updates.name ?? existing.name,
    updates.location ?? existing.location,
    updates.avg_cost ?? existing.avg_cost,
    updates.recommended_group ?? existing.recommended_group,
    updates.avg_rating ?? existing.avg_rating,
    updates.group_size ?? existing.group_size,
    updates.icon ?? existing.icon,
    updates.description ?? existing.description,
    updates.google_place_id ?? existing.google_place_id,
    id,
  );

  return getDate(id);
}

export function deleteDate(id: string): boolean {
  db.prepare("DELETE FROM dates WHERE id = ?").run(id);
  return true;
}

/* =====================================================
   RATINGS
===================================================== */

export function getRating(id: string): Rating | null {
  const row = db.prepare("SELECT * FROM ratings WHERE id = ?").get(id);
  return (row as Rating) ?? null;
}

export function createRating(rating: Rating): Rating | null {
  db.prepare(
    `
    INSERT INTO ratings (
      id, user_id, date_id,
      romance_level, group_size,
      cost, good_bad, first_date, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    rating.id,
    rating.user_id,
    rating.date_id,
    rating.romance_level,
    rating.group_size,
    rating.cost,
    rating.good_bad,
    rating.first_date,
    rating.created_at,
  );

  return getRating(rating.id);
}

export function updateRating(
  id: string,
  updates: Partial<Rating>,
): Rating | null {
  const existing = getRating(id);
  if (!existing) throw new Error("Rating not found");

  db.prepare(
    `
    UPDATE ratings SET
      user_id = ?, date_id = ?, romance_level = ?,
      group_size = ?, cost = ?, good_bad = ?,
      first_date = ?, created_at = ?
    WHERE id = ?
  `,
  ).run(
    updates.user_id ?? existing.user_id,
    updates.date_id ?? existing.date_id,
    updates.romance_level ?? existing.romance_level,
    updates.group_size ?? existing.group_size,
    updates.cost ?? existing.cost,
    updates.good_bad ?? existing.good_bad,
    updates.first_date ?? existing.first_date,
    updates.created_at ?? existing.created_at,
    id,
  );

  return getRating(id);
}

export function deleteRating(id: string): boolean {
  db.prepare("DELETE FROM ratings WHERE id = ?").run(id);
  return true;
}

export function getRatingsByDateId(dateId: string): Rating[] {
  const rows = db.prepare("SELECT * FROM ratings WHERE date_id = ?").all(dateId);
  return rows as Rating[];
}

export function getRecentRatingByUser(dateId: string, userId: string, hoursBack: number): Rating | null {
  const row = db.prepare(`
    SELECT * FROM ratings
    WHERE date_id = ? AND user_id = ?
    AND datetime(created_at) > datetime('now', '-${hoursBack} hours')
    ORDER BY created_at DESC
    LIMIT 1
  `).get(dateId, userId);
  return (row as Rating) ?? null;
}
