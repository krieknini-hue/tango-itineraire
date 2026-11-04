import { StealthClient } from '../stealthClient.js';

const BASE_URL = 'https://www.tango-argentin.fr';

export const ALL_REGIONS = [
  'centre-val-de-loire',
  'provence-alpes-cote-d-azur',
  'auvergne-rhone-alpes',
  'bourgogne-franche-comte',
  'occitanie',
  'ile-de-france',
  'nouvelle-aquitaine',
  'pays-de-la-loire',
  'grand-est',
  'hauts-de-france',
  'normandie',
  'bretagne',
  'corse'
];

export const CORRIDOR_REGIONS = [
  'centre-val-de-loire',
  'auvergne-rhone-alpes',
  'bourgogne-franche-comte',
  'occitanie',
  'provence-alpes-cote-d-azur'
];

const FRENCH_DAYS = {
  'dimanche': 0,
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6
};

export class TangoArgentinScraper {
  constructor(options = {}) {
    this.client = new StealthClient(options);
    this.fetchEventDetails = options.fetchEventDetails !== false;
    this.expandUntil = options.expandUntil || null; // e.g. '2027-12-31'
  }

  async init() {
    await this.client.init();
  }

  /**
   * Scrapes events from a specific region page on tango-argentin.fr
   */
  async scrapeRegion(regionSlug) {
    const url = `${BASE_URL}/${regionSlug}`;
    console.log(`[Scraper] 🔍 Scanning region: ${regionSlug} (${url})...`);
    
    let html;
    try {
      const res = await this.client.fetchPage(url);
      html = res.html;
    } catch (err) {
      console.error(`[Scraper] ❌ Error fetching region ${regionSlug}:`, err.message);
      return { baseEvents: [], allOccurrences: [] };
    }

    // 1. Extract Leaflet map markers
    // Format: L.marker([lat, lng]).addTo(mymap).bindPopup('<b><a href="/ville/nom-event.html">Nom</a></b><br>Adresse<br>Date');
    const markerRegex = /L\.marker\(\[([-\d.]+),\s*([-\d.]+)\]\)[^;]*?\.bindPopup\('<b><a href="([^"]+)">([^<]+)<\/a><\/b><br>([^<]+)<br>([^<]+)'\);/g;
    const markerEvents = [];
    let match;

    while ((match = markerRegex.exec(html)) !== null) {
      const [, latStr, lngStr, eventPath, title, address, dateStr] = match;
      markerEvents.push({
        lat: parseFloat(latStr),
        lng: parseFloat(lngStr),
        eventUrl: eventPath.startsWith('http') ? eventPath : `${BASE_URL}${eventPath.startsWith('/') ? '' : '/'}${eventPath}`,
        title: title.trim(),
        address: address.trim(),
        dateStr: dateStr.trim(),
        region: regionSlug
      });
    }

    console.log(`[Scraper] Found ${markerEvents.length} events from map markers in ${regionSlug}`);

    // 2. Fetch full event details from individual pages
    const baseEvents = [];
    const allOccurrences = [];

    for (const raw of markerEvents) {
      let eventDetails = null;
      if (this.fetchEventDetails && raw.eventUrl) {
        try {
          eventDetails = await this._scrapeEventDetails(raw.eventUrl);
        } catch (err) {
          console.warn(`[Scraper] ⚠️ Warning parsing detail for ${raw.title}:`, err.message);
        }
      }

      const baseEvent = this._normalizeEvent(raw, eventDetails, regionSlug);
      baseEvents.push(baseEvent);
      allOccurrences.push(baseEvent);

      // 3. Generate occurrences up to expandUntil (e.g. 2027-12-31)
      if (this.expandUntil) {
        const occurrences = this._generateOccurrences(baseEvent, eventDetails, raw.dateStr, this.expandUntil);
        allOccurrences.push(...occurrences);
      }
    }

    return { baseEvents, allOccurrences };
  }

  /**
   * Fetches and parses an individual event page for JSON-LD schema & details
   */
  async _scrapeEventDetails(eventUrl) {
    const { html } = await this.client.fetchPage(eventUrl);
    
    let jsonLdData = null;
    const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(m[1]);
        if (parsed['@type'] === 'DanceEvent' || parsed['@type'] === 'Event') {
          jsonLdData = parsed;
          break;
        }
      } catch {
        // Ignore JSON parse errors in non-event scripts
      }
    }

    // Extract upcoming dates from "Les autres Rdv de..."
    const otherDatesRegex = /href="[^"]*\?d=(\d{4}-\d{2}-\d{2})"/gi;
    const upcomingDates = new Set();
    let odMatch;
    while ((odMatch = otherDatesRegex.exec(html)) !== null) {
      upcomingDates.add(odMatch[1]);
    }

    // Also extract text info from the page table
    const details = {
      jsonLd: jsonLdData,
      phone: null,
      email: null,
      website: null,
      dj: null,
      price: null,
      hours: null,
      exhibitors: [],
      upcomingDates: Array.from(upcomingDates)
    };

    // Parse specific badges/exhibitors if present
    const boutiqueMatch = html.match(/Boutique Ephemere[^<]*Vetements Et Chaussures[\s\S]*?Expo-vente ([^<]+)/i);
    if (boutiqueMatch) {
      const brands = boutiqueMatch[1]
        .split(/\bet\b/i)
        .map(b => b.trim())
        .filter(Boolean);
      details.exhibitors.push(...brands);
    }

    // Extract table rows
    const rowRegex = /<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi;
    let rMatch;
    while ((rMatch = rowRegex.exec(html)) !== null) {
      const key = rMatch[1].replace(/<[^>]+>/g, '').trim().toLowerCase();
      const val = rMatch[2].replace(/<[^>]+>/g, '').trim();

      if (key.includes('tél')) details.phone = val;
      if (key.includes('e-mail') || key.includes('mail')) details.email = val;
      if (key.includes('site web')) details.website = val;
      if (key.includes('dj')) details.dj = val;
      if (key.includes('entrée') || key.includes('tarif')) details.price = val;
      if (key.includes('horaire')) details.hours = val;
    }

    return details;
  }

  /**
   * Transforms raw scraped data into our app's unified TangoEvent format
   */
  _normalizeEvent(rawMarker, details, regionSlug) {
    const jsonLd = details?.jsonLd || {};
    const location = jsonLd.location || {};
    const addressObj = location.address || {};
    const geo = location.geo || {};
    const organizer = jsonLd.organizer || {};
    const performer = Array.isArray(jsonLd.performer) ? jsonLd.performer[0] : jsonLd.performer;

    // Dates & Times
    let date = '';
    let startTime = '20:30';
    let endTime = '01:00';

    if (jsonLd.startDate) {
      try {
        const d = new Date(jsonLd.startDate);
        date = d.toISOString().split('T')[0];
        startTime = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      } catch {
        // Fallback
      }
    }

    if (jsonLd.endDate) {
      try {
        const d = new Date(jsonLd.endDate);
        endTime = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
      } catch {
        // Fallback
      }
    }

    // Fallback date from marker string if JSON-LD missing
    if (!date && rawMarker.dateStr) {
      date = this._parseFrenchDate(rawMarker.dateStr);
    }

    // Determine Day of Week (0 = Dimanche, 1 = Lundi, etc.)
    const dayOfWeek = this._extractDayOfWeek(rawMarker.dateStr, date);

    // City & Postal Code
    const city = addressObj.addressLocality || this._extractCityFromAddress(rawMarker.address);
    const postalCode = addressObj.postalCode || this._extractPostalCode(rawMarker.address);
    const streetAddress = addressObj.streetAddress || rawMarker.address;

    // Lat & Lng
    const lat = geo.latitude ? parseFloat(geo.latitude) : rawMarker.lat;
    const lng = geo.longitude ? parseFloat(geo.longitude) : rawMarker.lng;

    // Title & Event Type
    const title = jsonLd.name || rawMarker.title;
    const lowerTitle = title.toLowerCase();
    let type = 'milonga';
    if (lowerTitle.includes('pratique') || lowerTitle.includes('practica')) type = 'pratique';
    else if (lowerTitle.includes('festival')) type = 'festival';
    else if (lowerTitle.includes('marathon')) type = 'marathon';
    else if (lowerTitle.includes('stage') || lowerTitle.includes('cours')) type = 'stage';

    // Price
    const price = jsonLd.offers?.price || details?.price || 'Entrée standard';

    // DJ
    let dj = details?.dj || (performer?.name ? performer.name : 'DJ invité');

    // Generate unique reproducible slug ID
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `ta-${slug}-${date || 'base'}`;

    return {
      id,
      title,
      type,
      organizer: {
        name: organizer.name || `Organisation ${title}`,
        phone: organizer.telephone || details?.phone || undefined,
        email: organizer.email || details?.email || undefined,
        website: organizer.url || details?.website || undefined,
        verified: true
      },
      date: date || new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      address: streetAddress,
      city: city || 'France',
      postalCode: postalCode || '',
      lat: isNaN(lat) ? 0 : lat,
      lng: isNaN(lng) ? 0 : lng,
      price: price.toString().includes('€') || price.toString().toLowerCase().includes('euro') ? price : `${price} €`,
      floor: 'Parquet',
      airConditioning: true,
      cloakroom: true,
      parking: 'Stationnement à proximité',
      catering: 'Bar associatif / Rafraîchissements',
      vibe: type === 'pratique' ? 'Pratique libre et informelle' : 'Conviviale / Mixte',
      dj,
      djStyle: 'Sélection traditionnelle & tandas classiques',
      registrationRequired: type === 'marathon' || type === 'festival',
      roleBalanceEnforced: false,
      exhibitors: details?.exhibitors?.length ? details.exhibitors : undefined,
      status: 'confirmed',
      recurrence: {
        dayOfWeek: dayOfWeek !== -1 ? dayOfWeek : 3,
        frequency: (type === 'milonga' || type === 'pratique') ? 'weekly' : 'single'
      },
      _source: {
        portal: 'tango-argentin.fr',
        region: regionSlug,
        url: rawMarker.eventUrl,
        scrapedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generates all occurrences for a recurring milonga up to expandUntil (e.g. 2027-12-31)
   */
  _generateOccurrences(baseEvent, details, dateStr, untilDateStr) {
    const occurrences = [];
    const untilDate = new Date(untilDateStr);
    const existingDates = new Set([baseEvent.date]);

    // 1. Explicit dates found on the page (up to 2027-12-31)
    if (details?.upcomingDates) {
      for (const dStr of details.upcomingDates) {
        if (dStr <= untilDateStr && !existingDates.has(dStr)) {
          existingDates.add(dStr);
          occurrences.push({
            ...baseEvent,
            id: `${baseEvent.id.replace(/-\d{4}-\d{2}-\d{2}$/, '')}-${dStr}`,
            date: dStr,
            isRecurringInstance: true
          });
        }
      }
    }

    // 2. If it's a regular milonga or pratique, project weekly occurrences
    if (baseEvent.type === 'milonga' || baseEvent.type === 'pratique') {
      const dayOfWeek = baseEvent.recurrence?.dayOfWeek ?? this._extractDayOfWeek(dateStr, baseEvent.date);
      if (dayOfWeek !== -1) {
        const start = new Date(baseEvent.date);
        const cur = new Date(start);
        cur.setUTCDate(cur.getUTCDate() + 7); // start with next week

        while (cur <= untilDate) {
          const isoDate = cur.toISOString().split('T')[0];
          if (!existingDates.has(isoDate)) {
            existingDates.add(isoDate);
            occurrences.push({
              ...baseEvent,
              id: `${baseEvent.id.replace(/-\d{4}-\d{2}-\d{2}$/, '')}-${isoDate}`,
              date: isoDate,
              isRecurringInstance: true
            });
          }
          cur.setUTCDate(cur.getUTCDate() + 7);
        }
      }
    }

    return occurrences;
  }

  /**
   * Extracts day of week (0 to 6) from French date string or ISO date
   */
  _extractDayOfWeek(dateStr, isoDate) {
    if (dateStr) {
      const lower = dateStr.toLowerCase();
      for (const [dayName, dayNum] of Object.entries(FRENCH_DAYS)) {
        if (lower.startsWith(dayName) || lower.includes(` ${dayName} `) || lower.includes(`${dayName} `)) {
          return dayNum;
        }
      }
    }
    if (isoDate) {
      try {
        return new Date(isoDate).getUTCDay();
      } catch {
        // Fallback
      }
    }
    return -1;
  }

  /**
   * Scrapes association directory from /annuaire/cours
   */
  async scrapeAnnuaire() {
    const url = `${BASE_URL}/annuaire/cours`;
    console.log(`[Scraper] 🔍 Scanning annuaire: ${url}...`);

    let html;
    try {
      const res = await this.client.fetchPage(url);
      html = res.html;
    } catch (err) {
      console.error('[Scraper] ❌ Error fetching annuaire:', err.message);
      return [];
    }

    const associations = [];
    const cardRegex = /<div class="card card-annonce"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
    let match;

    while ((match = cardRegex.exec(html)) !== null) {
      const cardHtml = match[1];

      // City
      const cityMatch = cardHtml.match(/<span class="card-city">\s*([^<]+)\s*<\/span>/i);
      const city = cityMatch ? cityMatch[1].trim() : '';

      // Title & External URL
      const linkMatch = cardHtml.match(/<a href="([^"]+)"[^>]*style="font-weight:500"[^>]*>\s*([\s\S]*?)\s*<\/a>/i);
      const website = linkMatch ? linkMatch[1].trim() : '';
      const name = linkMatch ? linkMatch[2].replace(/<[^>]+>/g, '').trim() : '';

      // Internal page
      const internalMatch = cardHtml.match(/<a href="(\/cours\/[^"]+)"/i);
      const internalUrl = internalMatch ? `${BASE_URL}${internalMatch[1]}` : '';

      if (name) {
        associations.push({
          id: `asso-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`,
          name,
          city,
          website: website.startsWith('http') ? website : undefined,
          internalUrl,
          verified: true
        });
      }
    }

    console.log(`[Scraper] Found ${associations.length} associations/schools in annuaire`);
    return associations;
  }

  /**
   * Helper: Parses French dates like "Samedi 7 novembre 2026" into YYYY-MM-DD
   */
  _parseFrenchDate(dateStr) {
    const months = {
      'janvier': '01', 'février': '02', 'fevrier': '02', 'mars': '03',
      'avril': '04', 'mai': '05', 'juin': '06', 'juillet': '07',
      'août': '08', 'aout': '08', 'septembre': '09', 'octobre': '10',
      'novembre': '11', 'décembre': '12', 'decembre': '12'
    };

    const match = dateStr.match(/(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthStr = match[2].toLowerCase();
      const month = months[monthStr] || '01';
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
    return '';
  }

  _extractPostalCode(addressStr) {
    const match = addressStr.match(/\b(2[AB]|\d{2})\d{3}\b/);
    return match ? match[0] : '';
  }

  _extractCityFromAddress(addressStr) {
    const match = addressStr.match(/\b\d{5}\s+([A-Za-zÀ-ÖØ-öø-ÿ\s\-']+)/);
    return match ? match[1].trim() : '';
  }
}
