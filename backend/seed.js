/**
 * Seed script — run with: node backend/seed.js
 * Inserts sample dates and ratings. Safe to re-run (INSERT OR IGNORE).
 */

const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

const db = new Database(path.join(__dirname, '../date-nite.db'));

// ── Schema migration ─────────────────────────────────────────────────────────
// Add missing columns if the DB was created before they existed
const dateColumns = db.pragma('table_info(dates)').map(c => c.name);
if (!dateColumns.includes('google_place_id')) {
  db.exec('ALTER TABLE dates ADD COLUMN google_place_id TEXT');
  console.log('Migrated: added google_place_id to dates');
}

const ratingColumns = db.pragma('table_info(ratings)').map(c => c.name);
if (!ratingColumns.includes('created_at')) {
  db.exec("ALTER TABLE ratings ADD COLUMN created_at TEXT NOT NULL DEFAULT ''");
  console.log('Migrated: added created_at to ratings');
}

// ── Dates ────────────────────────────────────────────────────────────────────

const dates = [
  {
    id: 'seed-date-01',
    type: 'non-venue',
    name: 'Stargazing at the Park',
    location: 'Local park or hilltop',
    avg_cost: 0,
    recommended_group: 'couple',
    avg_rating: 0,
    group_size: 'double',
    icon: '🌟',
    description: 'Grab a blanket, download a star map app, and head somewhere dark. Surprisingly romantic and totally free.',
    google_place_id: null,
  },
  {
    id: 'seed-date-02',
    type: 'venue',
    name: 'Board Game Café',
    location: 'Downtown',
    avg_cost: 15,
    recommended_group: 'any',
    avg_rating: 0,
    group_size: 'group',
    icon: '🎲',
    description: 'Pick from hundreds of games, order drinks and snacks, and settle in for a few hours of friendly competition. Great for groups or one-on-one.',
    google_place_id: null,
  },
  {
    id: 'seed-date-03',
    type: 'non-venue',
    name: 'Cook a New Recipe Together',
    location: 'At home',
    avg_cost: 30,
    recommended_group: 'couple',
    avg_rating: 0,
    group_size: 'double',
    icon: '🍜',
    description: 'Pick an ambitious recipe neither of you has made before — homemade pasta, sushi, or a fancy dessert. The chaos is half the fun.',
    google_place_id: null,
  },
  {
    id: 'seed-date-04',
    type: 'venue',
    name: 'Drive-In Movie',
    location: 'Varies by city',
    avg_cost: 20,
    recommended_group: 'couple',
    avg_rating: 0,
    group_size: 'double',
    icon: '🚗',
    description: 'Old-school charm. Pack snacks, tune into the FM station, and watch a double feature from the comfort of your car.',
    google_place_id: null,
  },
  {
    id: 'seed-date-05',
    type: 'non-venue',
    name: 'Hiking & Picnic',
    location: 'Nearby trail',
    avg_cost: 10,
    recommended_group: 'any',
    avg_rating: 0,
    group_size: 'group',
    icon: '🥾',
    description: 'Find a trail with a good view, pack lunch, and enjoy a few hours outside. Easy to scale up to a group or keep it just the two of you.',
    google_place_id: null,
  },
  {
    id: 'seed-date-06',
    type: 'venue',
    name: 'Bowling Night',
    location: 'Local bowling alley',
    avg_cost: 25,
    recommended_group: 'any',
    avg_rating: 0,
    group_size: 'group',
    icon: '🎳',
    description: 'Classic for a reason — low pressure, easy to talk between turns, and someone always ends up in the gutter. Rented shoes included.',
    google_place_id: null,
  },
  {
    id: 'seed-date-07',
    type: 'venue',
    name: 'Art Museum',
    location: 'City museum district',
    avg_cost: 12,
    recommended_group: 'couple',
    avg_rating: 0,
    group_size: 'double',
    icon: '🖼️',
    description: "Wander galleries, debate what the abstract pieces mean, and grab coffee afterward. You'll learn something about each other's taste.",
    google_place_id: null,
  },
  {
    id: 'seed-date-08',
    type: 'non-venue',
    name: 'Movie Marathon at Home',
    location: 'At home',
    avg_cost: 0,
    recommended_group: 'any',
    avg_rating: 0,
    group_size: 'group',
    icon: '🍿',
    description: 'Pick a theme — director, decade, or genre — build a fort, and commit to at least three films. Blankets and snacks mandatory.',
    google_place_id: null,
  },
  {
    id: 'seed-date-09',
    type: 'venue',
    name: 'Mini Golf',
    location: 'Local mini golf course',
    avg_cost: 14,
    recommended_group: 'any',
    avg_rating: 0,
    group_size: 'group',
    icon: '⛳',
    description: 'Competitive enough to be interesting, casual enough that nobody cares about the score. Windmills and castles included.',
    google_place_id: null,
  },
  {
    id: 'seed-date-10',
    type: 'non-venue',
    name: 'Bake-Off Challenge',
    location: 'At home',
    avg_cost: 20,
    recommended_group: 'couple',
    avg_rating: 0,
    group_size: 'double',
    icon: '🧁',
    description: 'Each person picks a baked good to make, you taste-test each other\'s results, and the winner gets to pick the next date.',
    google_place_id: null,
  },
];

const insertDate = db.prepare(`
  INSERT OR IGNORE INTO dates
    (id, type, name, location, avg_cost, recommended_group, avg_rating, group_size, icon, description, google_place_id)
  VALUES
    (@id, @type, @name, @location, @avg_cost, @recommended_group, @avg_rating, @group_size, @icon, @description, @google_place_id)
`);

let datesInserted = 0;
for (const d of dates) {
  const result = insertDate.run(d);
  if (result.changes > 0) datesInserted++;
}
console.log(`Dates: inserted ${datesInserted}, skipped ${dates.length - datesInserted} (already existed)`);

// ── Ratings ──────────────────────────────────────────────────────────────────
// Fake user IDs (no real users needed — SQLite doesn't enforce FK constraints)

const FAKE_USERS = [
  'seed-user-A', 'seed-user-B', 'seed-user-C',
  'seed-user-D', 'seed-user-E', 'seed-user-F',
];

const ratingsData = [
  // Stargazing — beloved, great for first dates
  { dateId: 'seed-date-01', userId: 'seed-user-A', romance: 'romantic', group: 'double', cost: 0, goodBad: 'good', firstDate: 1, daysAgo: 3 },
  { dateId: 'seed-date-01', userId: 'seed-user-B', romance: 'romantic', group: 'double', cost: 0, goodBad: 'good', firstDate: 1, daysAgo: 8 },
  { dateId: 'seed-date-01', userId: 'seed-user-C', romance: 'romantic', group: 'double', cost: 0, goodBad: 'good', firstDate: 0, daysAgo: 15 },
  { dateId: 'seed-date-01', userId: 'seed-user-D', romance: 'casual',   group: 'double', cost: 0, goodBad: 'good', firstDate: 1, daysAgo: 20 },
  { dateId: 'seed-date-01', userId: 'seed-user-E', romance: 'romantic', group: 'double', cost: 0, goodBad: 'bad',  firstDate: 0, daysAgo: 30 },

  // Board Game Café — mixed reviews, not great for first dates
  { dateId: 'seed-date-02', userId: 'seed-user-A', romance: 'casual', group: 'group', cost: 14, goodBad: 'good', firstDate: 0, daysAgo: 5 },
  { dateId: 'seed-date-02', userId: 'seed-user-B', romance: 'casual', group: 'group', cost: 18, goodBad: 'good', firstDate: 0, daysAgo: 12 },
  { dateId: 'seed-date-02', userId: 'seed-user-C', romance: 'casual', group: 'double', cost: 15, goodBad: 'bad',  firstDate: 1, daysAgo: 18 },
  { dateId: 'seed-date-02', userId: 'seed-user-D', romance: 'casual', group: 'group', cost: 12, goodBad: 'good', firstDate: 0, daysAgo: 25 },

  // Cook Together — excellent, great for first dates
  { dateId: 'seed-date-03', userId: 'seed-user-A', romance: 'romantic', group: 'double', cost: 35, goodBad: 'good', firstDate: 1, daysAgo: 2 },
  { dateId: 'seed-date-03', userId: 'seed-user-B', romance: 'romantic', group: 'double', cost: 28, goodBad: 'good', firstDate: 1, daysAgo: 9 },
  { dateId: 'seed-date-03', userId: 'seed-user-C', romance: 'casual',   group: 'double', cost: 30, goodBad: 'good', firstDate: 1, daysAgo: 14 },
  { dateId: 'seed-date-03', userId: 'seed-user-D', romance: 'romantic', group: 'double', cost: 40, goodBad: 'good', firstDate: 0, daysAgo: 21 },
  { dateId: 'seed-date-03', userId: 'seed-user-E', romance: 'romantic', group: 'double', cost: 25, goodBad: 'good', firstDate: 1, daysAgo: 28 },
  { dateId: 'seed-date-03', userId: 'seed-user-F', romance: 'casual',   group: 'double', cost: 32, goodBad: 'bad',  firstDate: 0, daysAgo: 35 },

  // Drive-In — popular and romantic
  { dateId: 'seed-date-04', userId: 'seed-user-A', romance: 'romantic', group: 'double', cost: 22, goodBad: 'good', firstDate: 1, daysAgo: 4 },
  { dateId: 'seed-date-04', userId: 'seed-user-B', romance: 'romantic', group: 'double', cost: 20, goodBad: 'good', firstDate: 1, daysAgo: 11 },
  { dateId: 'seed-date-04', userId: 'seed-user-C', romance: 'romantic', group: 'double', cost: 18, goodBad: 'good', firstDate: 0, daysAgo: 19 },
  { dateId: 'seed-date-04', userId: 'seed-user-D', romance: 'casual',   group: 'double', cost: 20, goodBad: 'bad',  firstDate: 1, daysAgo: 27 },

  // Hiking — mostly positive, casual
  { dateId: 'seed-date-05', userId: 'seed-user-A', romance: 'casual', group: 'group', cost: 8, goodBad: 'good', firstDate: 0, daysAgo: 6 },
  { dateId: 'seed-date-05', userId: 'seed-user-B', romance: 'casual', group: 'double', cost: 10, goodBad: 'good', firstDate: 1, daysAgo: 13 },
  { dateId: 'seed-date-05', userId: 'seed-user-C', romance: 'casual', group: 'group', cost: 12, goodBad: 'good', firstDate: 0, daysAgo: 22 },
  { dateId: 'seed-date-05', userId: 'seed-user-D', romance: 'casual', group: 'double', cost: 5, goodBad: 'bad',  firstDate: 0, daysAgo: 40 },

  // Bowling — decent, fun for groups
  { dateId: 'seed-date-06', userId: 'seed-user-A', romance: 'casual', group: 'group', cost: 26, goodBad: 'good', firstDate: 0, daysAgo: 7 },
  { dateId: 'seed-date-06', userId: 'seed-user-B', romance: 'casual', group: 'group', cost: 24, goodBad: 'good', firstDate: 1, daysAgo: 16 },
  { dateId: 'seed-date-06', userId: 'seed-user-C', romance: 'casual', group: 'double', cost: 28, goodBad: 'bad',  firstDate: 0, daysAgo: 23 },

  // Art Museum — highly recommended, great for first dates
  { dateId: 'seed-date-07', userId: 'seed-user-A', romance: 'romantic', group: 'double', cost: 12, goodBad: 'good', firstDate: 1, daysAgo: 1 },
  { dateId: 'seed-date-07', userId: 'seed-user-B', romance: 'casual',   group: 'double', cost: 12, goodBad: 'good', firstDate: 1, daysAgo: 10 },
  { dateId: 'seed-date-07', userId: 'seed-user-C', romance: 'romantic', group: 'double', cost: 14, goodBad: 'good', firstDate: 1, daysAgo: 17 },
  { dateId: 'seed-date-07', userId: 'seed-user-D', romance: 'casual',   group: 'double', cost: 10, goodBad: 'good', firstDate: 0, daysAgo: 24 },
  { dateId: 'seed-date-07', userId: 'seed-user-E', romance: 'romantic', group: 'double', cost: 12, goodBad: 'good', firstDate: 1, daysAgo: 31 },

  // Movie Marathon — laid-back, low cost
  { dateId: 'seed-date-08', userId: 'seed-user-A', romance: 'casual', group: 'group', cost: 0, goodBad: 'good', firstDate: 0, daysAgo: 2 },
  { dateId: 'seed-date-08', userId: 'seed-user-B', romance: 'casual', group: 'double', cost: 0, goodBad: 'good', firstDate: 0, daysAgo: 14 },
  { dateId: 'seed-date-08', userId: 'seed-user-C', romance: 'casual', group: 'group', cost: 0, goodBad: 'bad',  firstDate: 0, daysAgo: 26 },

  // Mini Golf — fun, not many ratings yet
  { dateId: 'seed-date-09', userId: 'seed-user-A', romance: 'casual', group: 'group', cost: 14, goodBad: 'good', firstDate: 1, daysAgo: 3 },
  { dateId: 'seed-date-09', userId: 'seed-user-B', romance: 'casual', group: 'double', cost: 14, goodBad: 'good', firstDate: 1, daysAgo: 45 },

  // Bake-Off — loved by all who tried it
  { dateId: 'seed-date-10', userId: 'seed-user-A', romance: 'romantic', group: 'double', cost: 20, goodBad: 'good', firstDate: 0, daysAgo: 5 },
  { dateId: 'seed-date-10', userId: 'seed-user-B', romance: 'romantic', group: 'double', cost: 22, goodBad: 'good', firstDate: 1, daysAgo: 12 },
  { dateId: 'seed-date-10', userId: 'seed-user-C', romance: 'casual',   group: 'double', cost: 18, goodBad: 'good', firstDate: 0, daysAgo: 20 },
];

const insertRating = db.prepare(`
  INSERT OR IGNORE INTO ratings
    (id, user_id, date_id, romance_level, group_size, cost, good_bad, first_date, created_at)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// After inserting ratings, recalculate avg_cost and avg_rating on the dates table
const updateDateStats = db.prepare(`
  UPDATE dates SET
    avg_rating = (
      SELECT ROUND(SUM(CASE WHEN good_bad = 'good' THEN 1.0 ELSE 0 END) * 5.0 / COUNT(*), 1)
      FROM ratings WHERE date_id = dates.id
    ),
    avg_cost = (
      SELECT ROUND(AVG(cost), 0) FROM ratings WHERE date_id = dates.id
    )
  WHERE id = ?
`);

let ratingsInserted = 0;
const seenDateIds = new Set();

for (const r of ratingsData) {
  const id = `seed-rating-${r.dateId}-${r.userId}`;
  const createdAt = new Date(Date.now() - r.daysAgo * 86400000).toISOString();
  const result = insertRating.run(id, r.userId, r.dateId, r.romance, r.group, r.cost, r.goodBad, r.firstDate ? 1 : 0, createdAt);
  if (result.changes > 0) ratingsInserted++;
  seenDateIds.add(r.dateId);
}

// Recalculate avg_rating and avg_cost for all seeded dates
for (const dateId of seenDateIds) {
  updateDateStats.run(dateId);
}

console.log(`Ratings: inserted ${ratingsInserted}, skipped ${ratingsData.length - ratingsInserted} (already existed)`);
console.log(`Updated stats for ${seenDateIds.size} dates.`);
console.log('Done! Restart the backend if it\'s running.');
