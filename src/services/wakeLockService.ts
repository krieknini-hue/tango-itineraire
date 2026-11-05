/**
 * Service de gestion du verrouillage de mise en veille d'écran (Screen Wake Lock API)
 * Permet de maintenir l'écran allumé pendant les trajets sans interruption.
 */

type WakeLockListener = (isActive: boolean) => void;

class WakeLockService {
  private sentinel: WakeLockSentinel | null = null;
  private isRequested = false;
  private listeners: Set<WakeLockListener> = new Set();

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.isRequested && document.visibilityState === 'visible') {
          // Ré-acquérir le verrou si l'application revient au premier plan
          this.request().catch(() => {});
        }
      });
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public get isActive(): boolean {
    return this.sentinel !== null && !this.sentinel.released;
  }

  public subscribe(listener: WakeLockListener): () => void {
    this.listeners.add(listener);
    listener(this.isActive);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const active = this.isActive;
    this.listeners.forEach((listener) => {
      try {
        listener(active);
      } catch (e) {
        console.warn('[WakeLock] Erreur listener :', e);
      }
    });
  }

  public async request(): Promise<boolean> {
    this.isRequested = true;

    if (!this.isSupported()) {
      // Fallback gracieux si l'API n'est pas disponible (navigateur ancien, webview restrictive)
      this.notify();
      return false;
    }

    try {
      if (this.sentinel && !this.sentinel.released) {
        this.notify();
        return true;
      }

      this.sentinel = await navigator.wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.sentinel = null;
        this.notify();
      });

      this.notify();
      return true;
    } catch (err) {
      console.warn('[WakeLock] Impossible de maintenir l\'écran allumé :', err);
      this.sentinel = null;
      this.notify();
      return false;
    }
  }

  public async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        console.warn('[WakeLock] Erreur lors de la libération :', err);
      } finally {
        this.sentinel = null;
      }
    }
    this.notify();
  }
}

export const wakeLockService = new WakeLockService();
