import { StealthClient } from './stealthClient.js';

async function parseTangopolixJson() {
  const client = new StealthClient();
  await client.init();
  const res = await client.fetchPage('https://www.tangopolix.com/tango-events-calendar');
  
  // Find data-calendar-events-value or data-events or similar
  const match = res.html.match(/data-[a-z0-9_-]*events[a-z0-9_-]*="([^"]+)"/i);
  if (match) {
    const rawJson = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    try {
      const events = JSON.parse(rawJson);
      console.log('Total events in Tangopolix JSON:', events.length);
      const franceEvents = events.filter(e => e.country_name === 'France' || e.country_code === 'FR');
      console.log('France events count:', franceEvents.length);
      console.log('Sample France events:', franceEvents.slice(0, 3));
    } catch (e) {
      console.error('JSON parse error:', e.message);
    }
  } else {
    console.log('No data attribute matched.');
  }
}

parseTangopolixJson();
