import { StealthClient } from '../stealthClient.js';

export class TangopolixScraper {
  constructor(options = {}) {
    this.client = new StealthClient(options);
  }

  async init() {
    await this.client.init();
  }

  async scrapeFranceEvents() {
    console.log('[Tangopolix] 🔍 Moissonnage des festivals & marathons...');
    try {
      const res = await this.client.fetchPage('https://www.tangopolix.com/tango-events-calendar');
      const match = res.html.match(/data-[a-z0-9_-]*events[a-z0-9_-]*="([^"]+)"/i);
      if (!match) return [];

      const rawJson = match[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

      const allEvents = JSON.parse(rawJson);
      const franceEvents = allEvents.filter(
        (e) => e.country_name === 'France' || e.country_code === 'FR'
      );

      console.log(`[Tangopolix] ✅ ${franceEvents.length} festivals/marathons trouvés en France`);
      return franceEvents.map((raw) => this._formatEvent(raw));
    } catch (err) {
      console.warn('[Tangopolix] ⚠️ Erreur :', err.message);
      return [];
    }
  }

  _formatEvent(raw) {
    let type = 'festival';
    if (raw.category === 'marathon' || raw.category_text?.toLowerCase().includes('marathon')) {
      type = 'marathon';
    } else if (raw.category === 'ball_special_milonga') {
      type = 'milonga';
    }

    return {
      title: raw.title.replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim(),
      city: raw.city || 'Paris',
      startDate: raw.start,
      endDate: raw.end || raw.start,
      type,
      categoryText: raw.category_text || 'Festival international',
      url: raw.url?.startsWith('http') ? raw.url : `https://www.tangopolix.com${raw.url}`
    };
  }
}
