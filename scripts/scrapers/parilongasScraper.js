import { StealthClient } from '../stealthClient.js';

const PARILONGAS_DAYS = [
  { slug: 'lundimonday', dayOfWeek: 1, name: 'Lundi' },
  { slug: 'mardituesday', dayOfWeek: 2, name: 'Mardi' },
  { slug: 'mercrediwednesday', dayOfWeek: 3, name: 'Mercredi' },
  { slug: 'jeudithursday', dayOfWeek: 4, name: 'Jeudi' },
  { slug: 'vendredifriday', dayOfWeek: 5, name: 'Vendredi' },
  { slug: 'samedisaturday', dayOfWeek: 6, name: 'Samedi' },
  { slug: 'dimanchesunday', dayOfWeek: 0, name: 'Dimanche' }
];

export class ParilongasScraper {
  constructor(options = {}) {
    this.client = new StealthClient(options);
  }

  async init() {
    await this.client.init();
  }

  async scrapeAllDays() {
    console.log('[Parilongas] 🔍 Moissonnage des milongas parisiennes par jour...');
    const allEvents = [];

    for (const d of PARILONGAS_DAYS) {
      try {
        const url = `https://www.parilongas.fr/index/${d.slug}`;
        const res = await this.client.fetchPage(url);
        const dayEvents = this._parseDayHtml(res.html, d);
        console.log(`[Parilongas]  ${d.name} : ${dayEvents.length} événements`);
        allEvents.push(...dayEvents);
      } catch (err) {
        console.warn(`[Parilongas] ⚠️ Erreur ${d.name} :`, err.message);
      }
    }

    return allEvents;
  }

  _parseDayHtml(html, dayInfo) {
    const clean = html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|tr|li|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');

    const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
    const events = [];
    const timeRegex = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('▪️') && timeRegex.test(line)) {
        const parts = line.split('▪️').map((p) => p.trim());
        const tMatch = parts[0].match(timeRegex);
        const title = parts[1];
        const address = parts[2];

        if (!title || !address) continue;

        let dj = 'DJ résident';
        let price = '10 €';
        let metro = '';

        for (let j = 1; j <= 5 && i + j < lines.length; j++) {
          const next = lines[i + j];
          if (next.includes('▪️') && timeRegex.test(next)) break;
          if (next.includes('DJ')) {
            const djMatch = next.match(/DJ\s*([^\t€🔗📞🗓️\n]+)/i);
            if (djMatch) dj = djMatch[1].trim();
          }
          if (next.includes('€')) {
            const pMatch = next.match(/€\s*([^\t🔗📞🗓️\n]+)/i);
            if (pMatch) price = `${pMatch[1].trim()} €`;
          }
          if (next.includes('Ⓜ️')) {
            const mMatch = next.match(/Ⓜ️\s*([^\t€🔗📞🗓️\n]+)/i);
            if (mMatch) metro = mMatch[1].trim();
          }
        }

        events.push({
          title: title.trim(),
          address: address.trim(),
          city: 'Paris',
          startTime: tMatch ? tMatch[1] : '20:00',
          endTime: tMatch ? tMatch[2] : '01:00',
          dj,
          price,
          metro,
          dayOfWeek: dayInfo.dayOfWeek,
          dayName: dayInfo.name
        });
      }
    }

    return events;
  }
}
