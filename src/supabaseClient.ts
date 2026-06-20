import { createClient } from '@supabase/supabase-js';

// Graceful fallback values in case environment variables aren't set yet
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder-project-id.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-anon-key-abcde12345';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check if credentials are valid placeholder or actual ones
export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY && 
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder-project-id')
  );
};