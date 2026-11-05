import type { TangoEvent } from '../types/tango';

/**
 * 2. CONVERTISSEUR TEMPS -> TANDAS
 * Base universelle de bal Tango : 1 tanda (3 ou 4 morceaux) + cortina = 12 minutes.
 */
export function formatDurationToTandas(totalMinutes: number): {
  tandasCount: number;
  badgeText: string;
  shortBadgeText: string;
} {
  const safeMinutes = Math.max(1, Math.round(totalMinutes));
  const tandas = Math.max(1, Math.round(safeMinutes / 12));

  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}` : `${mins} min`;

  return {
    tandasCount: tandas,
    badgeText: `${timeFormatted} • 🎶 env. ${tandas} tanda${tandas > 1 ? 's' : ''} de route`,
    shortBadgeText: `🎶 ~${tandas} tanda${tandas > 1 ? 's' : ''}`,
  };
}

/**
 * 3. INDICATEUR "TEMPS DE DANSE RESTANT"
 * Si une heure de fin de milonga est renseignée (ou par défaut 01h00 du matin),
 * calcule la différence entre l'heure d'arrivée estimée (ETA) et la fin de la soirée.
 * 
 * Code couleur :
 * - Vert : > 2h de danse
 * - Orange : 1h à 2h de danse
 * - Rouge : < 1h ("Juste à temps pour La Cumparsita !")
 */

export interface RemainingDanceTimeResult {
  remainingMinutes: number;
  remainingHoursFormatted: string;
  badgeLabel: string;
  colorScheme: 'green' | 'orange' | 'red';
  isCumparsita: boolean;
  isOver: boolean;
  etaFormatted: string;
  endTimeFormatted: string;
}

/**
 * Extrait les heures et minutes d'une chaîne horaire (ex: "01h30", "01:00", "2h", "00:00")
 */
function parseTimeString(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 1, minutes: 0 }; // Défaut 01h00 du matin

  const clean = timeStr.trim().toLowerCase();
  const match = clean.match(/(\d{1,2})[h:]?(\d{2})?/);
  if (!match) return { hours: 1, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;

  if (hours >= 24) hours = 0;
  return { hours, minutes };
}

export function calculateRemainingDanceTime(
  event: TangoEvent,
  travelDurationMinutes: number = 0
): RemainingDanceTimeResult {
  const now = new Date();
  
  // Heure estimée d'arrivée (ETA)
  const etaDate = new Date(now.getTime() + travelDurationMinutes * 60 * 1000);
  const etaFormatted = `${etaDate.getHours().toString().padStart(2, '0')}h${etaDate.getMinutes().toString().padStart(2, '0')}`;

  // Heure de fin prévue (défaut 01h00 du matin si non renseignée)
  const endParsed = parseTimeString(event.endTime || '01:00');
  const endTimeFormatted = `${endParsed.hours.toString().padStart(2, '0')}h${endParsed.minutes.toString().padStart(2, '0')}`;

  // Construction de l'objet Date pour la fin de la milonga
  // Si l'heure de fin est inférieure à 12h (ex: 01h00, 02h00, 04h00), il s'agit du lendemain matin
  const endDate = new Date(now);
  if (endParsed.hours < 12) {
    // Si on est déjà tard le soir ou avant minuit, la fin est le lendemain
    if (now.getHours() >= 12) {
      endDate.setDate(endDate.getDate() + 1);
    }
  }
  endDate.setHours(endParsed.hours, endParsed.minutes, 0, 0);

  // Temps restant en minutes
  const diffMs = endDate.getTime() - etaDate.getTime();
  const remainingMinutes = Math.floor(diffMs / (60 * 1000));

  if (remainingMinutes <= 0) {
    return {
      remainingMinutes: 0,
      remainingHoursFormatted: '0 min',
      badgeLabel: 'Bal terminé à l\'arrivée',
      colorScheme: 'red',
      isCumparsita: false,
      isOver: true,
      etaFormatted,
      endTimeFormatted,
    };
  }

  const hoursRemaining = Math.floor(remainingMinutes / 60);
  const minsRemaining = remainingMinutes % 60;
  const remainingHoursFormatted =
    hoursRemaining > 0
      ? `${hoursRemaining}h${minsRemaining > 0 ? minsRemaining.toString().padStart(2, '0') : ''}`
      : `${minsRemaining} min`;

  // Code couleur & Statut Cumparsita
  if (remainingMinutes > 120) {
    return {
      remainingMinutes,
      remainingHoursFormatted,
      badgeLabel: `🎉 > ${hoursRemaining}h de danse restante`,
      colorScheme: 'green',
      isCumparsita: false,
      isOver: false,
      etaFormatted,
      endTimeFormatted,
    };
  }

  if (remainingMinutes >= 60) {
    return {
      remainingMinutes,
      remainingHoursFormatted,
      badgeLabel: `⏳ ${remainingHoursFormatted} de bal restant`,
      colorScheme: 'orange',
      isCumparsita: false,
      isOver: false,
      etaFormatted,
      endTimeFormatted,
    };
  }

  // Moins d'une heure restante : alerte Cumparsita !
  return {
    remainingMinutes,
    remainingHoursFormatted,
    badgeLabel: `🔴 Juste à temps pour La Cumparsita ! (${remainingMinutes} min)`,
    colorScheme: 'red',
    isCumparsita: true,
    isOver: false,
    etaFormatted,
    endTimeFormatted,
  };
}
