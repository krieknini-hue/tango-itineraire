export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Tango PWA ServiceWorker enregistré avec succès:', registration.scope);
        })
        .catch((error) => {
          console.warn('Erreur enregistrement ServiceWorker:', error);
        });
    });
  }
}
