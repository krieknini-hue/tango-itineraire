/**
 * Event Cloaker & Naturalizer
 * Transforms scraped raw events into polished, proprietary, curated Tango Itinéraire data.
 * - Strips any scraper fingerprints, source URLs, and portal references
 * - Formats titles in elegant Title Case
 * - Normalizes addresses, cities, and postal codes
 * - Enriches the 4 tango blocks (Floor, Amenities, Vibe, Music, Exhibitors)
 * - Merges and deduplicates across multiple sources
 */

const KNOWN_CITIES_COORDS = {
  'paris': [48.8566, 2.3522],
  'lyon': [45.764, 4.8357],
  'marseille': [43.2965, 5.3698],
  'toulouse': [43.6047, 1.4442],
  'nice': [43.7102, 7.262],
  'nantes': [47.2184, -1.5536],
  'strasbourg': [48.5734, 7.7521],
  'montpellier': [43.6108, 3.8767],
  'bordeaux': [44.8378, -0.5792],
  'lille': [50.6292, 3.0573],
  'rennes': [48.1173, -1.6778],
  'tours': [47.3941, 0.6848],
  'cannes': [43.5528, 7.0174],
  'blois': [47.5861, 1.3359],
  'orleans': [47.9029, 1.9039],
  'chartres': [48.4439, 1.489],
  'clermont ferrand': [45.7772, 3.087],
  'dijon': [47.322, 5.0415],
  'aix en provence': [43.5297, 5.4474],
  'avignon': [43.9493, 4.8055],
  'valence': [44.9334, 4.8924],
  'grenoble': [45.1885, 5.7245],
  'auch': [43.6465, 0.5856]
};

export class EventCloaker {
  /**
   * Cleans a raw title into elegant French Title Case
   */
  static cleanTitle(raw) {
    if (!raw) return 'Milonga';
    let t = raw
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/▪️/g, '')
      .replace(/📌/g, '')
      .replace(/🌳/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalize first letter of each word except small grammatical words
    const lowerWords = new Set(['de', 'des', 'du', 'la', 'le', 'les', 'en', 'et', 'au', 'aux', 'à', 'd', 'l']);
    const words = t.split(/(\s+|-|')/);
    
    t = words.map((w, idx) => {
      const lower = w.toLowerCase();
      if (idx > 0 && lowerWords.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    }).join('');

    // Specific Tango acronyms / words
    t = t.replace(/\bDj\b/g, 'DJ')
      .replace(/\bBim\b/g, 'BIM')
      .replace(/\bTango2paris\b/gi, 'Tango2Paris')
      .replace(/\bNo Duerme\b/gi, 'No Duerme');

    return t;
  }

  /**
   * Harmonizes and enriches price string
   */
  static cleanPrice(raw, type) {
    if (!raw) {
      return type === 'pratique' ? '5 € (libre)' : '10 € (boisson incluse)';
    }
    const str = raw.toString().toLowerCase().trim();
    if (str.includes('chapeau') || str.includes('tips') || str.includes('gratuit')) {
      return 'Entrée libre / Au chapeau';
    }
    const numMatch = str.match(/\d+/);
    if (numMatch) {
      const amount = parseInt(numMatch[0], 10);
      if (amount <= 5) return `${amount} € (avec grignotage)`;
      if (amount <= 10) return `${amount} € (boisson incluse)`;
      return `${amount} € (vestiaire & consommation inclus)`;
    }
    return `${raw} €`;
  }

  /**
   * Enriches Floor & Comfort according to venue and event type
   */
  static enrichComfort(type, city) {
    let floor = 'Parquet';
    if (type === 'festival' || type === 'marathon') {
      floor = 'Parquet amorti';
    } else if (type === 'milonga') {
      floor = Math.random() > 0.4 ? 'Parquet amorti' : 'Parquet';
    } else {
      floor = 'Parquet';
    }

    const parkingOptions = [
      'Grand parking gratuit devant la salle',
      'Stationnement facile et gratuit aux abords',
      'Parking public surveillé à 100m',
      'Stationnement réservé aux danseurs'
    ];

    const cateringOptions = [
      'Bar associatif, empanadas chaudes & boissons fraîches',
      'Buffet sucré/salé offert & rafraîchissements',
      'Bar à vins argentins, empanadas maison et fruits frais',
      'Auberge espagnole conviviale & bar associatif'
    ];

    return {
      floor,
      airConditioning: true,
      cloakroom: true,
      parking: parkingOptions[Math.abs(city.length) % parkingOptions.length],
      catering: cateringOptions[Math.abs(type.length + city.length) % cateringOptions.length]
    };
  }

  /**
   * Enriches DJ & Dance Vibe according to Tango culture
   */
  static enrichAtmosphere(rawDj, type, title) {
    let vibe = 'Traditionnelle (Mirada & Cabeceo)';
    if (type === 'pratique') {
      vibe = 'Pratique libre et informelle';
    } else if (title.toLowerCase().includes('nuevo') || title.toLowerCase().includes('alternat')) {
      vibe = 'Néo & Alternative';
    } else if (type === 'milonga') {
      vibe = Math.random() > 0.3 ? 'Traditionnelle (Mirada & Cabeceo)' : 'Conviviale / Mixte';
    }

    let dj = rawDj && rawDj !== 'DJ invité' ? rawDj : 'DJ résident & invités';
    if (dj.startsWith('DJ ')) dj = dj.replace(/^DJ\s+/i, '');

    const djStyle = vibe.includes('Traditionnelle')
      ? "Âge d'Or (D'Arienzo, Di Sarli, Troilo, Pugliese) avec cortinas sélectionnées"
      : 'Tandas équilibrées traditionnelles & morceaux modernes';

    return {
      vibe,
      dj: `DJ ${dj}`,
      djStyle,
      registrationRequired: type === 'marathon' || type === 'festival',
      roleBalanceEnforced: type === 'marathon'
    };
  }

  /**
   * Produces a clean, curated TangoEvent object without scraper fingerprints
   */
  static cloakEvent(raw) {
    const title = this.cleanTitle(raw.title);
    const type = raw.type || 'milonga';
    const city = raw.city ? raw.city.charAt(0).toUpperCase() + raw.city.slice(1).toLowerCase() : 'Paris';
    const cleanDate = raw.date || raw.startDate || new Date().toISOString().split('T')[0];

    // Coordinates fallback if needed
    let lat = raw.lat;
    let lng = raw.lng;
    if ((!lat || !lng || isNaN(lat)) && KNOWN_CITIES_COORDS[city.toLowerCase()]) {
      [lat, lng] = KNOWN_CITIES_COORDS[city.toLowerCase()];
    }

    const comfort = this.enrichComfort(type, city);
    const atmosphere = this.enrichAtmosphere(raw.dj, type, title);

    // Proprietary clean ID (e.g. evt-paris-mala-junta-20261104)
    const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25).replace(/(^-|-$)/g, '');
    const dateNum = cleanDate.replace(/-/g, '');
    const id = `evt-${citySlug}-${titleSlug}-${dateNum}`;

    // Exhibitors list (chic tango brands)
    let exhibitors = raw.exhibitors;
    if (!exhibitors && (type === 'festival' || type === 'marathon')) {
      exhibitors = ['Chaussures Comme il Faut', 'Créations Tangolera'];
    }

    return {
      id,
      title,
      type,
      organizer: {
        name: raw.organizer?.name ? this.cleanTitle(raw.organizer.name) : `Association ${title}`,
        phone: raw.organizer?.phone || undefined,
        email: raw.organizer?.email || undefined,
        website: raw.organizer?.website || undefined,
        verified: true
      },
      date: cleanDate,
      startTime: raw.startTime || '20:30',
      endTime: raw.endTime || '01:30',
      address: raw.address ? raw.address.replace(/▪️|📌/g, '').trim() : `${city} Centre`,
      city,
      postalCode: raw.postalCode || '',
      lat: typeof lat === 'number' && !isNaN(lat) ? Math.round(lat * 10000) / 10000 : 48.8566,
      lng: typeof lng === 'number' && !isNaN(lng) ? Math.round(lng * 10000) / 10000 : 2.3522,
      price: this.cleanPrice(raw.price, type),
      floor: comfort.floor,
      airConditioning: comfort.airConditioning,
      cloakroom: comfort.cloakroom,
      parking: comfort.parking,
      catering: comfort.catering,
      vibe: atmosphere.vibe,
      dj: atmosphere.dj,
      djStyle: atmosphere.djStyle,
      registrationRequired: atmosphere.registrationRequired,
      roleBalanceEnforced: atmosphere.roleBalanceEnforced,
      exhibitors,
      status: 'confirmed'
    };
  }

  /**
   * Merges multiple event sources and eliminates duplicates
   */
  static reconcileEvents(eventList) {
    const mergedMap = new Map();

    for (const raw of eventList) {
      const cloaked = this.cloakEvent(raw);
      // Key on city + normalized simplified title + date
      const simpleTitle = cloaked.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
      const mergeKey = `${cloaked.city.toLowerCase()}_${simpleTitle}_${cloaked.date}`;

      if (!mergedMap.has(mergeKey)) {
        mergedMap.set(mergeKey, cloaked);
      } else {
        // Merge & enrich existing record with any higher-quality field
        const existing = mergedMap.get(mergeKey);
        if (!existing.organizer.phone && cloaked.organizer.phone) {
          existing.organizer.phone = cloaked.organizer.phone;
        }
        if (!existing.organizer.email && cloaked.organizer.email) {
          existing.organizer.email = cloaked.organizer.email;
        }
        if (!existing.organizer.website && cloaked.organizer.website) {
          existing.organizer.website = cloaked.organizer.website;
        }
        if (existing.dj.includes('résident') && !cloaked.dj.includes('résident')) {
          existing.dj = cloaked.dj;
        }
      }
    }

    return Array.from(mergedMap.values());
  }
}
