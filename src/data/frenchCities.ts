import type { CityLocation } from '../types/tango';

export const FRENCH_CITIES: Record<string, CityLocation> = {
  'tours': { name: 'Tours', lat: 47.3941, lng: 0.6848 },
  'cannes': { name: 'Cannes', lat: 43.5528, lng: 7.0174 },
  'paris': { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  'lyon': { name: 'Lyon', lat: 45.7640, lng: 4.8357 },
  'marseille': { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
  'bordeaux': { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  'toulouse': { name: 'Toulouse', lat: 43.6047, lng: 1.4442 },
  'nantes': { name: 'Nantes', lat: 47.2184, lng: -1.5536 },
  'nice': { name: 'Nice', lat: 43.7102, lng: 7.2620 },
  'clermont-ferrand': { name: 'Clermont-Ferrand', lat: 45.7772, lng: 3.0870 },
  'bourges': { name: 'Bourges', lat: 47.0810, lng: 2.3988 },
  'nevers': { name: 'Nevers', lat: 46.9909, lng: 3.1628 },
  'moulins': { name: 'Moulins', lat: 46.5681, lng: 3.3328 },
  'vichy': { name: 'Vichy', lat: 46.1244, lng: 3.4258 },
  'saint-etienne': { name: 'Saint-Étienne', lat: 45.4397, lng: 4.3872 },
  'valence': { name: 'Valence', lat: 44.9334, lng: 4.8924 },
  'montelimar': { name: 'Montélimar', lat: 44.5569, lng: 4.7495 },
  'orange': { name: 'Orange', lat: 44.1381, lng: 4.8077 },
  'avignon': { name: 'Avignon', lat: 43.9493, lng: 4.8055 },
  'aix-en-provence': { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474 },
  'toulon': { name: 'Toulon', lat: 43.1242, lng: 5.9280 },
  'antibes': { name: 'Antibes', lat: 43.5804, lng: 7.1251 },
  'montpellier': { name: 'Montpellier', lat: 43.6108, lng: 3.8767 },
  'nimes': { name: 'Nîmes', lat: 43.8367, lng: 4.3601 },
  'grenoble': { name: 'Grenoble', lat: 45.1885, lng: 5.7245 },
  'annecy': { name: 'Annecy', lat: 45.8992, lng: 6.1294 },
  'chambery': { name: 'Chambéry', lat: 45.5646, lng: 5.9178 },
  'dijon': { name: 'Dijon', lat: 47.3220, lng: 5.0415 },
  'beaune': { name: 'Beaune', lat: 47.0260, lng: 4.8400 },
  'chalon-sur-saone': { name: 'Chalon-sur-Saône', lat: 46.7808, lng: 4.8528 },
  'macon': { name: 'Mâcon', lat: 46.3069, lng: 4.8287 },
  'orleans': { name: 'Orléans', lat: 47.9029, lng: 1.9093 },
  'limoges': { name: 'Limoges', lat: 45.8336, lng: 1.2611 },
  'brive-la-gaillarde': { name: 'Brive-la-Gaillarde', lat: 45.1585, lng: 1.5321 },
  'strasbourg': { name: 'Strasbourg', lat: 48.5734, lng: 7.7521 },
  'rennes': { name: 'Rennes', lat: 48.1173, lng: -1.6778 }
};

export function findCity(input: string): CityLocation | null {
  const normalized = input.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  for (const [key, city] of Object.entries(FRENCH_CITIES)) {
    const keyNorm = key.replace(/[^a-z0-9]/g, "");
    if (keyNorm === normalized || keyNorm.includes(normalized) || normalized.includes(keyNorm)) {
      return city;
    }
  }
  return null;
}
