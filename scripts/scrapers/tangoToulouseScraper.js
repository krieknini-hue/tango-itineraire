export class TangoToulouseScraper {
  async scrapeEvents() {
    console.log('[Toulouse] 🔍 Moissonnage de l\'agenda Occitanie / Toulouse...');
    try {
      const res = await fetch('http://www.tango-toulouse.net/REST/Bals2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codeSecret: 'zefze78ge',
          debut: Date.now(),
          nb: 100
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rawBals = data.bals || [];
      console.log(`[Toulouse] ✅ ${rawBals.length} bals trouvés en Occitanie`);

      return rawBals.map((b) => this._formatBal(b));
    } catch (err) {
      console.warn('[Toulouse] ⚠️ Erreur :', err.message);
      return [];
    }
  }

  _formatBal(bal) {
    // Extract lat/lng from Google Maps URL if present
    let lat = 43.6047;
    let lng = 1.4442;
    if (bal.lieuMaps) {
      const coordMatch = bal.lieuMaps.match(/@([-\d.]+),([-\d.]+)/);
      if (coordMatch) {
        lat = parseFloat(coordMatch[1]);
        lng = parseFloat(coordMatch[2]);
      }
    }

    // Date YYYY-MM-DD
    let date = '';
    if (bal.dateDebut) {
      const d = new Date(bal.dateDebut);
      if (!isNaN(d.getTime())) {
        date = d.toISOString().split('T')[0];
      }
    }

    return {
      title: bal.titre || 'Bal Tango',
      type: bal.type?.toLowerCase().includes('pratique') ? 'pratique' : 'milonga',
      organizer: {
        name: bal.nomAssociation || 'Association Tango Toulouse',
        website: bal.lien || undefined,
        verified: true
      },
      date: date || new Date().toISOString().split('T')[0],
      startTime: bal.heureDebut || '20:30',
      endTime: bal.heureFin || '01:00',
      address: bal.lieuAdresse1 || bal.lieuNom || 'Toulouse',
      city: bal.lieuVilleCP || 'Toulouse',
      postalCode: '',
      lat,
      lng,
      price: bal.tarif ? `${bal.tarif} €` : '10 €',
      dj: bal.dj || 'DJ invité',
      source: 'toulouse'
    };
  }
}
