import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration via variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co'
  );
};

// Client Supabase officiel, ou mock si pas encore configuré (zéro plantage en dev)
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (createClient(
      'https://placeholder-tango.supabase.co',
      'placeholder-anon-key'
    ) as SupabaseClient);
