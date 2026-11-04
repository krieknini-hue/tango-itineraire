-- ==============================================================================
-- 💃 SCHÉMA BASE DE DONNÉES SUPABASE + POSTGIS — TANGO ITINÉRAIRE
-- ==============================================================================

-- 1. Activer l'extension géospatiale PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Table des Profils Utilisateurs (Danseurs Nomades)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT DEFAULT 'Danseur Nomade',
    avatar_url TEXT,
    membership_status TEXT NOT NULL DEFAULT 'beta_free' CHECK (membership_status IN ('beta_free', 'active', 'expired')),
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days'),
    membership_expires_at TIMESTAMPTZ,
    is_cotisation_paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table des Événements Tango (4 Blocs complets)
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY DEFAULT ('evt-' || gen_random_uuid()),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('milonga', 'pratique', 'festival', 'marathon', 'stage')),
    
    -- Organisateur
    organizer_name TEXT NOT NULL,
    organizer_phone TEXT,
    organizer_email TEXT,
    organizer_website TEXT,
    organizer_verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Date & Horaires
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    
    -- Localisation & Géométrie PostGIS (WGS84 EPSG:4326)
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326),
    
    -- Tarifs
    price TEXT NOT NULL,
    
    -- Bloc Confort & Sol
    floor TEXT NOT NULL DEFAULT 'Parquet amorti',
    air_conditioning BOOLEAN NOT NULL DEFAULT FALSE,
    cloakroom BOOLEAN NOT NULL DEFAULT TRUE,
    parking TEXT,
    catering TEXT,
    
    -- Bloc Ambiance & Danse
    vibe TEXT NOT NULL DEFAULT 'Traditionnelle (Mirada & Cabeceo)',
    dj TEXT,
    dj_style TEXT,
    live_music TEXT,
    teachers TEXT,
    registration_required BOOLEAN NOT NULL DEFAULT FALSE,
    role_balance_enforced BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Bloc Exposants
    exhibitors TEXT[] DEFAULT '{}',
    
    -- Statut & Canal d'urgence
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index spatial GiST sur la géométrie PostGIS (recherches à grande vitesse)
CREATE INDEX IF NOT EXISTS idx_events_geom ON public.events USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);

-- Trigger pour synchroniser automatiquement la colonne PostGIS `geom` depuis (lat, lng)
CREATE OR REPLACE FUNCTION public.sync_event_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_event_geom ON public.events;
CREATE TRIGGER trg_sync_event_geom
BEFORE INSERT OR UPDATE OF lat, lng ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.sync_event_geom();

-- 4. Fonction RPC PostGIS : Recherche le long d'un corridor routier
-- Prend en entrée le LineString de la route (format GeoJSON) et le rayon en mètres
CREATE OR REPLACE FUNCTION public.find_events_along_route(
    route_geojson TEXT,
    buffer_meters DOUBLE PRECISION DEFAULT 30000,
    target_date DATE DEFAULT NULL
)
RETURNS SETOF public.events AS $$
DECLARE
    route_geom GEOGRAPHY;
BEGIN
    route_geom := ST_GeomFromGeoJSON(route_geojson)::geography;
    
    RETURN QUERY
    SELECT e.*
    FROM public.events e
    WHERE ST_DWithin(e.geom, route_geom, buffer_meters)
      AND (target_date IS NULL OR e.date = target_date)
    ORDER BY ST_Distance(e.geom, route_geom) ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Table des Cotisations Associatives (Stripe 2 €)
CREATE TABLE IF NOT EXISTS public.memberships (
    id TEXT PRIMARY KEY DEFAULT ('mem-' || gen_random_uuid()),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    amount_cents INTEGER NOT NULL DEFAULT 200, -- 2,00 €
    currency TEXT NOT NULL DEFAULT 'eur',
    period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
    receipt_number TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Politiques de Sécurité (Row Level Security - RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- Lecture publique de tous les événements
CREATE POLICY "Lecture publique des événements" 
    ON public.events FOR SELECT 
    USING (true);

-- Lecture & modification de son propre profil
CREATE POLICY "Gestion de son propre profil" 
    ON public.profiles FOR ALL 
    USING (auth.uid() = id);

-- Lecture de ses propres cotisations
CREATE POLICY "Lecture de ses cotisations" 
    ON public.memberships FOR SELECT 
    USING (auth.uid() = user_id);
