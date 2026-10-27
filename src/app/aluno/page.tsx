import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth";
import { loadDB } from "@/lib/data";
import { buildPath, stats } from "@/lib/progress";
import { TrailPath, StatsHeader } from "@/components/trail-path";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Minha jornada", description: "Sua jornada no VAPE ZERO: situações, progresso e conquistas." };
export const dynamic = "force-dynamic";
const cat = { pressao: "Prevenção", curiosidade: "Prevenção", parar: "Apoio para parar" };
export default async function Aluno() {
  const u = await requireRole(["student"]);
  const db = (await loadDB());
  const started = ((await cookies()).get("vz_started")?.value ?? "").split(",");
  const path = buildPath(db, u, started);
  const st = stats(db, u);
  return (<div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Oi, {u.name.split(" ")[0]}! 👋</h1><p className="text-muted-foreground">Siga o caminho no seu ritmo. Aqui ninguém te julga.</p></div>
      <StatsHeader xp={st.xp} streak={st.streak} completed={st.completed} total={path.length} />
    </div>
    <section aria-label="Caminho de situações" className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-b from-secondary/60 via-background to-accent/40 py-12 shadow-sm">
      <TrailPath nodes={path.map((n) => ({ id: n.situation.id, title: n.situation.title, subtitle: cat[n.situation.category], state: n.state, href: `/aluno/situacao/${n.situation.slug}` }))} />
    </section>
    <p className="text-xs text-muted-foreground text-center">🔒 Situações de prevenção abrem em sequência. <strong>Dificuldade para parar</strong> está sempre liberada — apoio não espera.</p>
    <div className="text-center"><Link href="/aluno/trilha" className={buttonVariants({ size: "lg" })}>Ver minha trilha sugerida 🗺️</Link></div>
  </div>);
}
