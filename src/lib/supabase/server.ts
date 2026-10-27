import "server-only";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./env";

/** Cliente server-side com chave pública (RLS). A auth do app ainda é por cookie próprio, então não há sessão Supabase. */
export function supabaseServer() {
  if (!supabaseEnabled()) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws as never } }); // ws: Node < 22 não tem WebSocket nativo
}
