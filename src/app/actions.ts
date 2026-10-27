"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mutate, readDB, uid } from "@/lib/db";
import { deleteSituationRemote, loadDB, saveLead, saveResponse, saveSituationRemote } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearSession, getUser, memberById, requireRole, setSession, usingSupabaseAuth } from "@/lib/auth";
import { supabaseSession } from "@/lib/supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Choice, Situation } from "@/lib/types";

export type FormState = { error?: string; ok?: string } | undefined;
const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function loginAction(_: FormState, f: FormData): Promise<FormState> {
  const email = s(f, "email").toLowerCase(); const password = s(f, "password"); const area = s(f, "area");
  let m;
  if (usingSupabaseAuth()) {
    const sb = (await supabaseSession())!;
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) return { error: "E-mail ou senha incorretos." };
    m = await memberById(data.user.id, email);
    if (!m) { await sb.auth.signOut(); return { error: "Conta sem perfil na escola. Fale com o suporte." }; }
    if (area === "gestor" && m.role === "student") { await sb.auth.signOut(); return { error: "Esta área é para gestores. Use o login do aluno." }; }
  } else {
    m = readDB().members.find((x) => x.email === email);
    if (!m || !verifyPassword(password, m.passwordHash)) return { error: "E-mail ou senha incorretos." };
    if (area === "gestor" && m.role === "student") return { error: "Esta área é para gestores. Use o login do aluno." };
    await setSession(m.id);
  }
  redirect(m.role === "student" ? "/aluno" : m.role === "admin" ? "/admin" : "/painel");
}

export async function signupAction(_: FormState, f: FormData): Promise<FormState> {
  const name = s(f, "name"); const email = s(f, "email").toLowerCase(); const password = s(f, "password"); const code = s(f, "code").toUpperCase();
  if (!name || !email.includes("@") || password.length < 8) return { error: "Preencha nome, e-mail válido e senha com 8+ caracteres." };
  if (f.get("terms") !== "on") return { error: "É preciso aceitar os termos e confirmar autorização do responsável." };
  if (usingSupabaseAuth()) {
    const ad = supabaseAdmin()!;
    const { data: cls } = await ad.from("class").select("id,org_id").eq("join_code", code).maybeSingle();
    if (!cls) return { error: "Código da turma inválido. Peça ao seu professor (demo: 8A2026)." };
    const { data, error } = await ad.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
    if (error || !data.user) return { error: /already|registered|exists/i.test(error?.message ?? "") ? "Já existe uma conta com este e-mail." : "Não foi possível criar a conta agora. Tente de novo." };
    const ins = await ad.from("member").insert({ id: data.user.id, org_id: cls.org_id, class_id: cls.id, role: "student", display_name: name });
    if (ins.error) { await ad.auth.admin.deleteUser(data.user.id); return { error: "Não foi possível criar a conta agora. Tente de novo." }; }
    await (await supabaseSession())!.auth.signInWithPassword({ email, password });
    redirect("/aluno");
  }
  const db = readDB();
  if (db.members.some((m) => m.email === email)) return { error: "Já existe uma conta com este e-mail." };
  const cls = db.classes.find((c) => c.joinCode === code);
  if (!cls) return { error: "Código da turma inválido. Peça ao seu professor (demo: 8A2026)." };
  const id = uid("m");
  mutate((d) => d.members.push({ id, name, email, passwordHash: hashPassword(password), role: "student", orgId: cls.orgId, classId: cls.id, createdAt: new Date().toISOString() }));
  await setSession(id);
  redirect("/aluno");
}

export async function logoutAction() { await clearSession(); redirect("/"); }

export async function answerAction(situationId: string, choiceId: string) {
  const u = await getUser(); if (!u) return { error: "Faça login." };
  const db = await loadDB();
  const sit = db.situations.find((x) => x.id === situationId);
  const ch = sit?.choices.find((c) => c.id === choiceId); if (!sit || !ch) return { error: "Opção inválida." };
  try { if (await saveResponse({ memberId: u.id, classId: u.classId, situationId, choiceId, trail: ch.trail }, db.ids)) { revalidatePath("/aluno"); return { ok: true }; } }
  catch (e) { console.error("[supabase] resposta:", e); return { error: "Não foi possível salvar sua resposta. Tente de novo." }; }
  mutate((d) => {
    d.responses = d.responses.filter((r) => !(r.memberId === u.id && r.situationId === situationId));
    d.responses.push({ id: uid("r"), memberId: u.id, classId: u.classId, situationId, choiceId, trail: ch.trail, createdAt: new Date().toISOString() });
  });
  revalidatePath("/aluno");
  return { ok: true };
}

export async function leadAction(_: FormState, f: FormData): Promise<FormState> {
  const name = s(f, "name"), email = s(f, "email"), institution = s(f, "institution");
  if (!name || !email.includes("@") || !institution) return { error: "Preencha nome, e-mail e instituição." };
  await saveLead({ name, email, institution, role: s(f, "role"), message: s(f, "message") });
  return { ok: "Recebemos seu pedido! Entraremos em contato para agendar a demonstração." };
}

function parseSituation(f: FormData, existing?: Situation): Situation {
  const choices: Choice[] = [0, 1, 2].map((i) => ({
    id: existing?.choices[i]?.id ?? uid("c"), label: s(f, `c${i}_label`), feedback: s(f, `c${i}_feedback`),
    trail: (s(f, `c${i}_trail`) as Choice["trail"]) || "prevencao", nextStep: (s(f, `c${i}_next`) as Choice["nextStep"]) || "confianca",
  })).filter((c) => c.label);
  const title = s(f, "title");
  return {
    id: existing?.id ?? uid("sit"), slug: s(f, "slug") || title.toLowerCase().normalize("NFD").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    title, category: s(f, "category") as Situation["category"], summary: s(f, "summary"), body: s(f, "body"), question: s(f, "question") || "O que você faz?",
    illustration: (s(f, "illustration") as Situation["illustration"]) || "generica", published: f.get("published") === "on", choices, videoUrl: null,
  };
}
export async function saveSituationAction(_: FormState, f: FormData): Promise<FormState> {
  await requireRole(["admin"]);
  const id = s(f, "id"); const db = await loadDB(); const ex = db.situations.find((x) => x.id === id);
  const sit = parseSituation(f, ex);
  if (!sit.title || sit.choices.length < 2) return { error: "Título e pelo menos 2 escolhas são obrigatórios." };
  if (db.situations.some((x) => x.slug === sit.slug && x.id !== sit.id)) return { error: "Slug já usado." };
  let remote = false;
  try { remote = await saveSituationRemote(sit, db.ids); } catch (e) { console.error("[supabase] salvar situação:", (e as Error).message); return { error: "Não foi possível salvar agora. Tente de novo." }; }
  if (!remote) mutate((d) => { const i = d.situations.findIndex((x) => x.id === sit.id); if (i >= 0) d.situations[i] = sit; else d.situations.push(sit); });
  revalidatePath("/admin"); redirect("/admin");
}
export async function deleteSituationAction(f: FormData) {
  await requireRole(["admin"]);
  const id = s(f, "id"); const db = await loadDB();
  if (!(await deleteSituationRemote(id, db.ids))) mutate((d) => { d.situations = d.situations.filter((x) => x.id !== id); });
  revalidatePath("/admin");
}
