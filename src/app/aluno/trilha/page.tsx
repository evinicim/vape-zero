import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { loadDB } from "@/lib/data";
import { stats } from "@/lib/progress";
import { trails, nextSteps } from "@/lib/trail";
import { TrailKey } from "@/lib/types";
import { TrailPath, StatsHeader } from "@/components/trail-path";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Minha trilha", description: "Acompanhe as etapas da sua trilha de prevenção ou de apoio para parar." };
export const dynamic = "force-dynamic";
export default async function Trilha() {
  const u = await requireRole(["student"]);
  const db = (await loadDB()); const st = stats(db, u);
  const mine = db.responses.filter((r) => r.memberId === u.id);
  const branch = (k: TrailKey) => {
    const n = mine.filter((r) => r.trail === k).length; // cada resposta avança 1 etapa
    const active = st.trails.includes(k);
    return trails[k].steps.map((s, i) => ({ id: `${k}-${i}`, title: s, state: (!active ? "locked" : i < n ? "completed" : i === n ? "available" : "locked") as "locked" | "available" | "completed" }));
  };
  return (<div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-bold">Seu mapa 🗺️</h1><p className="text-muted-foreground">A trilha se adapta às suas escolhas. Prevenção e apoio para parar se encontram no mesmo destino: cuidar de você.</p></div>
      <StatsHeader xp={st.xp} streak={st.streak} completed={st.completed} total={db.situations.filter((s) => s.published).length} />
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      {(["prevencao", "apoio"] as TrailKey[]).map((k) => (
        <section key={k} className={`relative rounded-[2rem] border-2 p-6 shadow-sm ${st.trails.includes(k) ? "border-primary/30 bg-gradient-to-b from-secondary/70 to-background" : "border-dashed bg-muted/30 grayscale-[.6]"}`}>
          <div className="mb-6 text-center space-y-1"><p className="text-3xl" aria-hidden>{k === "prevencao" ? "🛡️" : "🤝"}</p><h2 className="text-xl font-semibold">{trails[k].title}{st.trails.includes(k) ? "" : " 🔒"}</h2><p className="text-sm text-muted-foreground">{trails[k].desc}</p>
            {st.trails.includes(k) ? <Badge>Sugerida para você</Badge> : <Badge variant="secondary">Responda situações para liberar</Badge>}</div>
          <TrailPath nodes={branch(k)} />
        </section>))}
    </div>
    <div className="hidden md:flex justify-around -my-3 px-24" aria-hidden><span className="h-10 w-1.5 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--border)_0_6px,transparent_6px_14px)]" /><span className="h-10 w-1.5 rounded-full bg-[repeating-linear-gradient(to_bottom,var(--border)_0_6px,transparent_6px_14px)]" /></div>
    <section className="relative rounded-[2rem] border-2 border-primary/30 bg-gradient-to-b from-accent/60 to-background p-6 pt-14 text-center space-y-3 shadow-sm">
      <span className="vz-float absolute -top-9 left-1/2 -ml-9 flex size-[72px] items-center justify-center rounded-full bg-gradient-to-b from-[oklch(0.9_0.12_90)] to-[oklch(0.8_0.14_80)] text-3xl ring-4 ring-background shadow-[0_6px_0_oklch(0.65_0.12_75)]" aria-hidden>🏁</span>
      <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Destino</p><h2 className="text-xl font-semibold">Sua rede de apoio</h2>
      <div className="grid gap-3 sm:grid-cols-3 text-sm">{Object.values(nextSteps).map((n, i) => <div key={n.title} className="vz-chip rounded-2xl border bg-card p-3 shadow-sm" style={{ ["--i" as string]: i + 4 }}><p className="font-semibold">{n.title}</p><p className="text-muted-foreground">{n.desc}</p></div>)}</div>
    </section>
    <div className="text-center"><Link href="/aluno" className={buttonVariants({ variant: "outline" })}>← Voltar ao caminho</Link></div>
  </div>);
}
