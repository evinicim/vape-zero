import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import ws from "ws";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseEnabled } from "./env";

/** Cliente com a sessão do usuário (cookies sb-*). Em Server Components o set de cookie é ignorado — o middleware renova. */
export async function supabaseSession() {
  if (!supabaseEnabled()) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => { try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Server Component */ } },
    },
    realtime: { transport: ws as never },
  });
}
