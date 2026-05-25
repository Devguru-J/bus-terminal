import {createClient, type SupabaseClient} from "@supabase/supabase-js";

// Supabase 환경변수가 비어 있으면 client는 null.
// 포크/로컬 사용자가 우리 호스트 DB에 모르고 쓰는 사고를 막기 위함.
// (이전 버전은 우리 프로젝트 URL/anon key를 하드코딩 fallback으로 가지고 있었음 — 보안 결함)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              storageKey: "bus-terminal:supabase-auth"
          }
      })
    : null;

export class SupabaseNotConfiguredError extends Error {
    constructor() {
        super("클라우드 동기화가 설정되어 있지 않아요. 환경변수 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 확인하세요.");
        this.name = "SupabaseNotConfiguredError";
    }
}

export function requireSupabase(): SupabaseClient {
    if (!supabase) throw new SupabaseNotConfiguredError();
    return supabase;
}
