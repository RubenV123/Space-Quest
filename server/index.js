import 'dotenv/config';
import express from 'express';

const app = express();
const port = Number(process.env.PORT || 3001);
const nasaKey = process.env.NASA_API_KEY || 'DEMO_KEY';
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || '')
  .split(',').map((origin) => origin.trim()).filter(Boolean));
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

async function cachedJson(key, url) {
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`NASA returned HTTP ${response.status}`);

  const value = await response.json();
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'space-quest-nasa-api' });
});

app.get('/api/nasa/apod', async (_req, res) => {
  try {
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

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

app.listen(port, '0.0.0.0', () => {
  console.log(`Space Quest NASA API listening on port ${port}`);
});
