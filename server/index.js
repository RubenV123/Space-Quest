import 'dotenv/config';
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { promisify } from 'node:util';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const app = express();
const scryptAsync = promisify(scrypt);
const port = Number(process.env.PORT || 3001);
const nasaKey = process.env.NASA_API_KEY || 'DEMO_KEY';
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;
const dataDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
mkdirSync(dataDirectory, { recursive: true });
const database = new DatabaseSync(join(dataDirectory, 'spacequest.sqlite'));
database.exec('PRAGMA foreign_keys = ON;');
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(lower(email));
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    learning_xp INTEGER NOT NULL DEFAULT 0,
    missions INTEGER NOT NULL DEFAULT 0,
    badges_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);
const profileColumns = database.prepare('PRAGMA table_info(profiles)').all().map((column) => column.name);
if (!profileColumns.includes('user_id')) {
  database.exec('ALTER TABLE profiles ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;');
}

const SCRYPT_COST = 1 << 17;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = 'spacequest_session';
const hashSessionToken = (token) => createHash('sha256').update(token).digest('hex');
const hashPassword = async (password, salt = randomBytes(16)) => {
  const derived = await scryptAsync(password, salt, 64, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
    maxmem: 256 * 1024 * 1024,
  });
  return { salt: salt.toString('hex'), hash: derived.toString('hex') };
};
const userFromRow = (row) => ({ id: row.id, email: row.email });
const insertUser = database.prepare('INSERT INTO users (id, email, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)');
const findUserByEmail = database.prepare('SELECT * FROM users WHERE lower(email) = lower(?)');
const findUserById = database.prepare('SELECT * FROM users WHERE id = ?');
const insertSession = database.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)');
const findSession = database.prepare('SELECT user_id, expires_at FROM sessions WHERE token_hash = ?');
const issueSession = (res, userId) => {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_MS);
  database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now.toISOString());
  insertSession.run(hashSessionToken(token), userId, expiresAt.toISOString(), now.toISOString());
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE_MS,
  });
};
const authRequired = (req, res, next) => {
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  const session = findSession.get(hashSessionToken(token));
  if (!session || session.expires_at <= new Date().toISOString()) {
    return res.status(401).json({ error: 'Please sign in again.' });
  }
  req.user = findUserById.get(session.user_id);
  if (!req.user) return res.status(401).json({ error: 'Please sign in again.' });
  return next();
};

const profileFromRow = (row) => ({
  id: row.id,
  name: row.name,
  level: row.level,
  xp: row.xp,
  learningXp: row.learning_xp,
  missions: row.missions,
  badges: JSON.parse(row.badges_json),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listProfiles = database.prepare('SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at ASC');
const findProfile = database.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?');
const insertProfile = database.prepare(`
  INSERT INTO profiles (id, user_id, name, level, xp, learning_xp, missions, badges_json, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateProfile = database.prepare(`
  UPDATE profiles SET name = ?, level = ?, xp = ?, learning_xp = ?, missions = ?, badges_json = ?, updated_at = ?
  WHERE id = ? AND user_id = ?
`);

app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

async function cachedJson(key, url) {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) {
    const error = new Error(`NASA returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const value = await response.json();
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'space-quest-api', profileStorage: 'sqlite' });
});

const loginAttempts = new Map();
const authRateLimit = (req, res, next) => {
  const key = req.socket.remoteAddress || 'local';
  const now = Date.now();
  const recent = (loginAttempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 10) return res.status(429).json({ error: 'Too many attempts. Wait 15 minutes and try again.' });
  recent.push(now);
  loginAttempts.set(key, recent);
  return next();
};

app.get('/api/auth/me', authRequired, (req, res) => {
  res.json({ user: userFromRow(req.user) });
});

app.post('/api/auth/register', authRateLimit, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({ error: 'Use a password between 12 and 128 characters.' });
  }
  if (findUserByEmail.get(email)) return res.status(409).json({ error: 'An account with that email already exists.' });

  try {
    const { salt, hash } = await hashPassword(password);
    const id = randomBytes(16).toString('hex');
    const now = new Date().toISOString();
    const firstAccount = database.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0;
    insertUser.run(id, email, salt, hash, now);
    if (firstAccount) database.prepare('UPDATE profiles SET user_id = ? WHERE user_id IS NULL').run(id);
    issueSession(res, id);
    return res.status(201).json({ user: userFromRow(findUserById.get(id)) });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }
    console.error('Registration failed:', error.message);
    return res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = findUserByEmail.get(email);
  if (!user || password.length > 128) return res.status(401).json({ error: 'Email or password is incorrect.' });

  try {
    const { hash } = await hashPassword(password, Buffer.from(user.password_salt, 'hex'));
    const stored = Buffer.from(user.password_hash, 'hex');
    const supplied = Buffer.from(hash, 'hex');
    if (stored.length !== supplied.length || !timingSafeEqual(stored, supplied)) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    issueSession(res, user.id);
    return res.json({ user: userFromRow(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ error: 'Could not sign in.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1);
  if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashSessionToken(token));
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' });
  return res.status(204).end();
});

app.get('/api/profiles', authRequired, (req, res) => {
  res.json(listProfiles.all(req.user.id).map(profileFromRow));
});

app.post('/api/profiles', authRequired, (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 40) : '';
  if (!name) return res.status(400).json({ error: 'A commander name is required.' });

  const integer = (value, fallback, minimum = 0) => Number.isSafeInteger(value) && value >= minimum ? value : fallback;
  const badges = Array.isArray(req.body?.badges) ? req.body.badges.filter((badge) => typeof badge === 'string').slice(0, 100) : [];
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  insertProfile.run(
    id,
    req.user.id,
    name,
    integer(req.body?.level, 1, 1),
    integer(req.body?.xp, 0),
    integer(req.body?.learningXp, 0),
    integer(req.body?.missions, 0),
    JSON.stringify(badges),
    now,
    now,
  );
  return res.status(201).json(profileFromRow(findProfile.get(id)));
});

app.put('/api/profiles/:id', authRequired, (req, res) => {
  const existing = findProfile.get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Profile not found.' });

  const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 40) : '';
  if (!name) return res.status(400).json({ error: 'A commander name is required.' });
  const integer = (value, fallback) => Number.isSafeInteger(value) && value >= 0 ? value : fallback;
  const badges = Array.isArray(req.body?.badges) ? req.body.badges.filter((badge) => typeof badge === 'string').slice(0, 100) : [];
  updateProfile.run(
    name,
    integer(req.body.level, existing.level),
    integer(req.body.xp, existing.xp),
    integer(req.body.learningXp, existing.learning_xp),
    integer(req.body.missions, existing.missions),
    JSON.stringify(badges),
    new Date().toISOString(),
    req.params.id,
    req.user.id,
  );
  return res.json(profileFromRow(findProfile.get(req.params.id, req.user.id)));
});

app.delete('/api/profiles/:id', authRequired, (req, res) => {
  const existing = findProfile.get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Profile not found.' });
  if (listProfiles.all(req.user.id).length <= 1) return res.status(409).json({ error: 'Keep at least one commander profile.' });
  database.prepare('DELETE FROM profiles WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  return res.status(204).end();
});

app.get('/api/nasa/apod', async (_req, res) => {
  try {
    // NASA's current APOD endpoint is hosted by NASA Science. It returns a
    // list of recent entries; use the first (latest) entry for the dashboard.
    const entries = await cachedJson(
      'apod-latest',
      `https://science.nasa.gov/wp-json/wp/v2/apod-basic/?api_key=${encodeURIComponent(nasaKey)}`,
    );
    const item = Array.isArray(entries) ? entries[0] : entries;
    if (!item?.title) throw new Error('NASA APOD response did not contain an item');

    res.json({
      date: item.date,
      title: item.title,
      explanation: item.explanation,
      imageUrl: item.hdurl || item.image_url || item.url,
      pageUrl: item.permalink || item.url,
      mediaType: item.media_type || 'image',
      credit: item.credit || item.copyright || '',
      alt: item.alt || item.title,
      source: 'NASA Astronomy Picture of the Day',
    });
  } catch (error) {
    console.error('APOD request failed:', error.message);
    res.status(502).json({ error: 'Could not load NASA Astronomy Picture of the Day.' });
  }
});

app.get('/api/nasa/neo', async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const data = await cachedJson(
      `neo-${today}`,
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${encodeURIComponent(nasaKey)}`,
    );
    const asteroids = (data.near_earth_objects?.[today] || []).map((neo) => {
      const approach = neo.close_approach_data?.[0];
      return {
        id: neo.id,
        name: neo.name,
        hazardous: neo.is_potentially_hazardous_asteroid,
        diameterKm: neo.estimated_diameter?.kilometers?.estimated_diameter_max,
        missDistanceKm: approach?.miss_distance?.kilometers,
        approachDate: approach?.close_approach_date,
        nasaUrl: neo.nasa_jpl_url,
      };
    });
    res.json({ date: today, count: data.element_count, asteroids, source: 'NASA/JPL Near Earth Object Web Service' });
  } catch (error) {
    console.error('NeoWs request failed:', error.message);
    res.status(502).json({ error: 'Could not load NASA near Earth object data.' });
  }
});

app.get('/api/nasa/meteorites', async (_req, res) => {
  try {
    // NASA currently serves this legacy dataset through its static resource path.
    const data = await cachedJson(
      'meteorite-landings-largest',
      'https://data.nasa.gov/docs/legacy/meteorite_landings/gh4g-9sfh.json',
    );
    const meteorites = (Array.isArray(data) ? data : [])
      .map((item) => ({
        name: item.name || item.place || 'Unnamed meteorite',
        year: item.year || item.year_date || '',
        recclass: item.recclass || item.type_of_meteorite || 'Unclassified',
        mass: String(item.mass ?? item.mass_g ?? 0),
      }))
      .filter((item) => Number.isFinite(Number(item.mass)) && Number(item.mass) > 0)
      .sort((a, b) => Number(b.mass) - Number(a.mass))
      .slice(0, 6);
    res.json({ meteorites, source: 'NASA Open Data Portal Meteorite Landings' });
  } catch (error) {
    console.error('Meteorite data request failed:', error.message);
    res.status(502).json({ error: 'Could not load NASA Meteorite Landings data.' });
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Space Quest API listening at http://127.0.0.1:${port}`);
});
