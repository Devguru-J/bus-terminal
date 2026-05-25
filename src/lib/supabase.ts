import {createClient} from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://vyjolbszizgrspawcdio.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5am9sYnN6aXpncnNwYXdjZGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjA4NzgsImV4cCI6MjA5NTE5Njg3OH0._XlYYTbmpD2fAUbmpxgTU7AQMvLPRf4CCCbNGb7GzrQ";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "bus-terminal:supabase-auth"
    }
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
