import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { registerServiceWorker } from './registerServiceWorker';
import { OrganizerView } from './components/OrganizerView';
import { findOrganizerByToken, getAdminTokenFromUrl } from './modules/organizer';

// Enregistrement PWA Service Worker (mode hors-ligne & tuiles carto)
registerServiceWorker();

// Lien magique `?admin_token=...` : bascule sur l'Espace Organisateur (sans compte)
const organizerSpace = findOrganizerByToken(getAdminTokenFromUrl());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {organizerSpace ? (
      <OrganizerView space={organizerSpace} />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
);
