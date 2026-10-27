import "server-only";
import { readDB, mutate, uid } from "./db";
import { DB, Lead, ResponseRow, Situation } from "./types";
import { supabaseServer } from "./supabase/server";
import { supabaseAdmin } from "./supabase/admin";

type Row = { id: string; slug: string; title: string; category: Situation["category"]; summary: string | null; illustration: string | null; published: boolean; video_asset_id: string | null;
  scenario_step: { position: number; body: string; question: string | null; choice: { id: string; position: number; label: string; feedback: string; trail: Situation["choices"][0]["trail"]; next_step: Situation["choices"][0]["nextStep"] }[] }[] };
/** Mapeia IDs locais estáveis (sit-pressao, c-p1…) <-> UUIDs do Supabase. */
export interface IdMap { sit: Record<string, string>; choice: Record<string, string> }

async function supabaseSituations(local: Situation[]): Promise<{ situations: Situation[]; ids: IdMap } | null> {
  const sb = supabaseAdmin() ?? supabaseServer(); if (!sb) return null;
  const { data, error } = await sb.from("situation")
    .select("id,slug,title,category,summary,illustration,published,video_asset_id,scenario_step(position,body,question,choice(id,position,label,feedback,trail,next_step))")
    .order("sort").returns<Row[]>();
  if (error || !data?.length) { if (error) console.error("[supabase] situações:", error.message); return null; }
  const ids: IdMap = { sit: {}, choice: {} };
  const situations = data.map((r) => {
    const step = [...r.scenario_step].sort((a, b) => a.position - b.position)[0];
    const loc = local.find((s) => s.slug === r.slug);
    const choices = [...(step?.choice ?? [])].sort((a, b) => a.position - b.position);
    const sid = loc?.id ?? r.id; ids.sit[sid] = r.id;
    return {
      id: sid, slug: r.slug, title: r.title, category: r.category, summary: r.summary ?? "", body: step?.body ?? loc?.body ?? "",
      question: step?.question ?? loc?.question ?? "", illustration: (r.illustration ?? "generica") as Situation["illustration"], published: r.published, videoUrl: r.video_asset_id,
      choices: choices.map((c, i) => { const cid = loc?.choices[i]?.id ?? c.id; ids.choice[cid] = c.id; return { id: cid, label: c.label, feedback: c.feedback, trail: c.trail, nextStep: c.next_step }; }),
    };
  });
  return { situations, ids };
}

/**
 * "Banco" do app. Com Supabase + service role: conteúdo, turmas, respostas e leads vêm do Supabase
 * (respostas com IDs locais mapeados). JSON local só como fallback offline.
 */
export async function loadDB(): Promise<DB & { ids?: IdMap }> {
  const db: DB & { ids?: IdMap } = readDB();
  const remote = await supabaseSituations(db.situations);
  if (!remote) return db;
  db.situations = remote.situations; db.ids = remote.ids;
  const ad = supabaseAdmin(); if (!ad) return db;
  const back = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));
  const sitL = back(remote.ids.sit), chL = back(remote.ids.choice);
  const [orgs, classes, resp, leads] = await Promise.all([
    ad.from("organization").select("id,name,kind"), ad.from("class").select("id,org_id,name,join_code"),
    ad.from("response").select("id,member_id,class_id,situation_id,choice_id,trail,created_at"), ad.from("lead").select("*").order("created_at", { ascending: false }),
  ]);
  if (orgs.data) db.organizations = orgs.data;
  if (classes.data) db.classes = classes.data.map((c) => ({ id: c.id, orgId: c.org_id, name: c.name, joinCode: c.join_code }));
  if (resp.data) db.responses = resp.data.map((r): ResponseRow => ({ id: r.id, memberId: r.member_id, classId: r.class_id ?? undefined, situationId: sitL[r.situation_id] ?? r.situation_id, choiceId: chL[r.choice_id] ?? r.choice_id, trail: r.trail, createdAt: r.created_at }));
  if (leads.data) db.leads = leads.data.map((l) => ({ id: l.id, name: l.name, email: l.email, institution: l.institution, role: l.role ?? "", message: l.message ?? "", createdAt: l.created_at }));
  db.members = [];
  return db;
}

/** Grava/atualiza a resposta do aluno (1 por situação). Retorna false se não há Supabase (usar JSON). */
export async function saveResponse(r: { memberId: string; classId?: string; situationId: string; choiceId: string; trail: ResponseRow["trail"] }, ids?: IdMap): Promise<boolean> {
  const ad = supabaseAdmin(); if (!ad || !ids) return false;
  const situation_id = ids.sit[r.situationId], choice_id = ids.choice[r.choiceId];
  if (!situation_id || !choice_id) throw new Error("Situação/escolha sem correspondência no Supabase");
  const { error } = await ad.from("response").upsert({ member_id: r.memberId, class_id: r.classId ?? null, situation_id, choice_id, trail: r.trail, created_at: new Date().toISOString() }, { onConflict: "member_id,situation_id" });
  if (error) throw new Error(error.message);
  return true;
}

/** Leads: Supabase quando configurado (RLS permite insert anônimo); senão JSON. */
export async function saveLead(l: Omit<Lead, "id" | "createdAt">) {
  const sb = supabaseServer();
  if (sb) {
    const { error } = await sb.from("lead").insert({ name: l.name, email: l.email, institution: l.institution, role: l.role || null, message: l.message || null });
    if (!error) return; console.error("[supabase] lead:", error.message);
  }
  mutate((d) => d.leads.push({ ...l, id: uid("lead"), createdAt: new Date().toISOString() }));
}

/** Admin: cria/atualiza situação no Supabase (situation + 1º scenario_step + choices). Retorna false sem Supabase. */
export async function saveSituationRemote(sit: Situation, ids?: IdMap): Promise<boolean> {
  const ad = supabaseAdmin(); if (!ad || !ids) return false;
  const fields = { slug: sit.slug, title: sit.title, category: sit.category, summary: sit.summary || null, illustration: sit.illustration, published: sit.published };
  let sitId = ids.sit[sit.id];
  if (sitId) { const { error } = await ad.from("situation").update(fields).eq("id", sitId); if (error) throw new Error(error.message); }
  else {
    const { data: last } = await ad.from("situation").select("sort").order("sort", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await ad.from("situation").insert({ ...fields, sort: (last?.sort ?? 0) + 1 }).select("id").single();
    if (error) throw new Error(error.message); sitId = data.id;
  }
  const { data: steps } = await ad.from("scenario_step").select("id,position").eq("situation_id", sitId).order("position").limit(1);
  let stepId = steps?.[0]?.id as string | undefined;
  if (stepId) { const { error } = await ad.from("scenario_step").update({ body: sit.body, question: sit.question }).eq("id", stepId); if (error) throw new Error(error.message); }
  else { const { data, error } = await ad.from("scenario_step").insert({ situation_id: sitId, position: 0, body: sit.body, question: sit.question }).select("id").single(); if (error) throw new Error(error.message); stepId = data.id; }
  // Atualiza escolhas no lugar (preserva respostas), insere novas, remove as que sumiram.
  const keep: string[] = [];
  for (const [i, c] of sit.choices.entries()) {
    const row = { step_id: stepId, position: i, label: c.label, feedback: c.feedback, trail: c.trail, next_step: c.nextStep };
    const cid = ids.choice[c.id];
    if (cid) { const { error } = await ad.from("choice").update(row).eq("id", cid); if (error) throw new Error(error.message); keep.push(cid); }
    else { const { data, error } = await ad.from("choice").insert(row).select("id").single(); if (error) throw new Error(error.message); keep.push(data.id); }
  }
  const { data: all } = await ad.from("choice").select("id").eq("step_id", stepId);
  const drop = (all ?? []).map((r) => r.id as string).filter((x) => !keep.includes(x));
  if (drop.length) { const { error } = await ad.from("choice").delete().in("id", drop); if (error) throw new Error(error.message); }
  return true;
}

/** Admin: exclui situação no Supabase (cascade em steps/choices/respostas). */
export async function deleteSituationRemote(id: string, ids?: IdMap): Promise<boolean> {
  const ad = supabaseAdmin(); if (!ad || !ids) return false;
  const sitId = ids.sit[id]; if (!sitId) return true;
  const { error } = await ad.from("situation").delete().eq("id", sitId); if (error) throw new Error(error.message);
  return true;
}
