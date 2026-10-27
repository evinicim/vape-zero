import "server-only";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { SUPABASE_URL } from "./env";

/** Cliente service role — só no servidor e só se SUPABASE_SERVICE_ROLE_KEY existir. Ignora RLS: use com cuidado. */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { transport: ws as never } }); // ws: Node < 22 não tem WebSocket nativo
}
