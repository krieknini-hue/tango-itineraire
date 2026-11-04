#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TangoArgentinScraper,
  CORRIDOR_REGIONS,
  ALL_REGIONS
} from './scrapers/tangoArgentinScraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../src/data');

async function main() {
  const args = process.argv.slice(2);
  const helpRequested = args.includes('--help') || args.includes('-h');
  const allRequested = args.includes('--all');
  const annuaireRequested = args.includes('--annuaire');
  const noCache = args.includes('--no-cache');
  const regionArgIdx = args.indexOf('--region');
  const specificRegion = regionArgIdx !== -1 ? args[regionArgIdx + 1] : null;

  const untilArgIdx = args.indexOf('--until');
  const expandUntil = untilArgIdx !== -1 ? args[untilArgIdx + 1] : (allRequested ? '2027-12-31' : null);

  if (helpRequested) {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║             TANGO ITINÉRAIRE — MOISSONNEUR DISCRET               ║
╚══════════════════════════════════════════════════════════════════╝

Commandes disponibles :
  node scripts/scrape.js                    Moissonne le corridor Tours ➔ Cannes (défaut)
  node scripts/scrape.js --all              Moissonne l'ensemble des 13 régions de France jusqu'au 31/12/2027
  node scripts/scrape.js --all --until 2027-12-31
  node scripts/scrape.js --region <r>       Moissonne une région spécifique (ex: ile-de-france)
  node scripts/scrape.js --annuaire         Moissonne l'annuaire des assos & écoles
  node scripts/scrape.js --no-cache         Ignore le cache disque local et re-télécharge tout
`);
    return;
  }

  console.log('🚀 Initialisation du Moissonneur Furtif Tango...');
  console.log('🛡️ Empreinte : Navigateur Chrome Windows + Jitter aléatoire (1.2s - 2.5s) + Cache');
  if (expandUntil) {
    console.log(`📅 Extension temporelle active : jusqu'au ${expandUntil} inclus.`);
  }

  const scraper = new TangoArgentinScraper({
    useCache: !noCache,
    minDelayMs: 1000,
    maxDelayMs: 2200,
    expandUntil
  });

  await scraper.init();
  await fs.mkdir(DATA_DIR, { recursive: true });

  const allBaseVenues = [];
  const allEventsOccurrences = [];
  let regionsToScrape = [];

  if (specificRegion) {
    regionsToScrape = [specificRegion];
  } else if (allRequested) {
    regionsToScrape = ALL_REGIONS;
  } else {
    // Corridor mode (Tours ➔ Cannes)
    regionsToScrape = CORRIDOR_REGIONS;
  }

  console.log(`📍 Régions sélectionnées (${regionsToScrape.length}) :`, regionsToScrape.join(', '));
  console.log('⏳ Début de l\'extraction discrète...\n');

  for (const reg of regionsToScrape) {
    const { baseEvents, allOccurrences } = await scraper.scrapeRegion(reg);
    allBaseVenues.push(...baseEvents);
    allEventsOccurrences.push(...allOccurrences);
  }

  // Deduplicate base venues
  const venueMap = new Map();
  for (const v of allBaseVenues) {
    if (!venueMap.has(v.id)) {
      venueMap.set(v.id, v);
    }
  }
  const uniqueVenues = Array.from(venueMap.values());

  // Deduplicate occurrences
  const eventMap = new Map();
  for (const evt of allEventsOccurrences) {
    if (!eventMap.has(evt.id)) {
      eventMap.set(evt.id, evt);
    }
  }
  const uniqueOccurrences = Array.from(eventMap.values());

  // Save to src/data/scraped_milongas.json (All dated occurrences)
  const eventsOutPath = path.join(DATA_DIR, 'scraped_milongas.json');
  await fs.writeFile(eventsOutPath, JSON.stringify(uniqueOccurrences, null, 2), 'utf-8');
  console.log(`\n💾 ${uniqueOccurrences.length} événements/occurrences sauvegardés dans: ${eventsOutPath}`);

  // Save to src/data/scraped_venues.json (Master venues/festivals catalog)
  const venuesOutPath = path.join(DATA_DIR, 'scraped_venues.json');
  await fs.writeFile(venuesOutPath, JSON.stringify(uniqueVenues, null, 2), 'utf-8');
  console.log(`💾 ${uniqueVenues.length} lieux/festivals uniques sauvegardés dans: ${venuesOutPath}`);

  // Annuaire associatif
  if (annuaireRequested || allRequested || args.length === 0) {
    console.log('\n📚 Moissonnage de l\'annuaire associatif...');
    const assos = await scraper.scrapeAnnuaire();
    const assosOutPath = path.join(DATA_DIR, 'associations.json');
    await fs.writeFile(assosOutPath, JSON.stringify(assos, null, 2), 'utf-8');
    console.log(`💾 ${assos.length} associations sauvegardées dans: ${assosOutPath}`);
  }

  // Print summary breakdown
  console.log('\n📊 RÉCAPITULATIF FRANCE ENTIÈRE :');
  console.log('────────────────────────────────────────');
  console.log(`Lieux / Milongas uniques : ${uniqueVenues.length}`);
  console.log(`Total Événements & Séances (jusqu'à fin 2027) : ${uniqueOccurrences.length}`);

  const cityCounts = {};
  for (const e of uniqueVenues) {
    cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
  }
  console.log('Top Villes (lieux) :', Object.entries(cityCounts).slice(0, 10).map(([c, n]) => `${c} (${n})`).join(', '));
  console.log('────────────────────────────────────────');
  console.log('✨ Terminé avec succès sans la moindre alerte ni blocage.');
}

main().catch((err) => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
