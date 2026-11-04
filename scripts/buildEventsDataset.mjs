/**
 * Construit public/data/events.json (chargé à l'exécution par l'app) depuis les
 * données scrapées : fusion milongas + venues (dédoublonnage par id), horaires
 * normalisés en HH:mm, événements passés écartés, JSON minifié, trié par date.
 *
 * Usage : npm run build:events   (lancé automatiquement avant `npm run build`)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = ['src/data/scraped_milongas.json', 'src/data/scraped_venues.json'];
const OUT = resolve(root, 'public/data/events.json');

const pad = (t) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t ?? '').trim());
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
};

const today = new Date();
const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const byId = new Map();
let total = 0;
for (const rel of SOURCES) {
  const file = resolve(root, rel);
  if (!existsSync(file)) {
    console.warn(`[events] source absente : ${rel}`);
    continue;
  }
  for (const e of JSON.parse(readFileSync(file, 'utf8'))) {
    total += 1;
    if (!e?.id || byId.has(e.id)) continue;
    const startTime = pad(e.startTime);
    const endTime = pad(e.endTime);
    const valid =
      /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
      Number.isFinite(e.lat) &&
      Number.isFinite(e.lng) &&
      startTime &&
      endTime &&
      e.date >= todayIso;
    if (!valid) continue;
    byId.set(e.id, { ...e, startTime, endTime });
  }
}

const events = [...byId.values()].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(events));
console.log(`[events] ${events.length} événements à venir (sur ${total} lus) → public/data/events.json`);
