"use client";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

let c: SupabaseClient | null = null;
/** Cliente de navegador (chave pública/anon, sujeito a RLS). */
export function supabaseBrowser() { return (c ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY)); }
