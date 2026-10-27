import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";
import { readDB } from "./db";
import { Member, Role } from "./types";
import { supabaseSession } from "./supabase/ssr";
import { supabaseAdmin } from "./supabase/admin";

// Produção: Supabase Auth (cookies sb-*). Fallback offline (sem env Supabase): cookie assinado + JSON.
const SECRET = process.env.SESSION_SECRET || "dev-secret-troque-em-producao";
const COOKIE = "vz_session";
const sign = (v: string) => createHmac("sha256", SECRET).update(v).digest("hex");
export const usingSupabaseAuth = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function setSession(memberId: string) {
  (await cookies()).set(COOKIE, `${memberId}.${sign(memberId)}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7, secure: process.env.NODE_ENV === "production" });
}
export async function clearSession() {
  if (usingSupabaseAuth()) await (await supabaseSession())?.auth.signOut();
  (await cookies()).delete(COOKIE);
}

/** Carrega o member (perfil) do Supabase no formato usado pelo app. */
export async function memberById(id: string, email = ""): Promise<Member | null> {
  const ad = supabaseAdmin(); if (!ad) return null;
  const { data } = await ad.from("member").select("id,org_id,class_id,role,display_name,created_at").eq("id", id).maybeSingle();
  if (!data) return null;
  return { id: data.id, email, name: data.display_name, passwordHash: "", role: data.role as Role, orgId: data.org_id, classId: data.class_id ?? undefined, createdAt: data.created_at };
}

export async function getUser(): Promise<Member | null> {
  if (usingSupabaseAuth()) {
    const sb = await supabaseSession(); if (!sb) return null;
    const { data: { user } } = await sb.auth.getUser();
    return user ? memberById(user.id, user.email ?? "") : null;
  }
  const raw = (await cookies()).get(COOKIE)?.value; if (!raw) return null;
  const i = raw.lastIndexOf("."); const id = raw.slice(0, i);
  if (sign(id) !== raw.slice(i + 1)) return null;
  return readDB().members.find((m) => m.id === id) ?? null;
}
export async function requireRole(roles: Role[], loginPath = "/entrar") {
  const u = await getUser();
  if (!u) redirect(loginPath);
  if (!roles.includes(u.role)) redirect("/");
  return u;
}
