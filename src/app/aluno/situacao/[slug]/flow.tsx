"use client";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { answerAction } from "@/app/actions";
import { Situation } from "@/lib/types";
import { nextSteps, trails } from "@/lib/trail";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "#f4a6a6"];
function Confetti() {
  return (<div className="vz-confetti pointer-events-none absolute inset-x-0 top-0 h-0" aria-hidden>
    {Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % 4], borderRadius: i % 3 === 0 ? "50%" : "2px", animationDelay: `${(i % 6) * 55}ms`, ["--dx" as string]: `${((i * 53) % 80) - 40}px`, ["--rot" as string]: `${i % 2 ? 540 : -420}deg` }} />)}</div>);
}

export function SituationFlow({ situation }: { situation: Situation }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { // marca a situação como "em progresso" no caminho
    const cur = (document.cookie.match(/(?:^|; )vz_started=([^;]*)/)?.[1] ?? "").split(",").filter(Boolean);
    if (!cur.includes(situation.id)) document.cookie = `vz_started=${[...cur, situation.id].join(",")}; path=/; max-age=31536000; samesite=lax`;
  }, [situation.id]);
  const ch = situation.choices.find((c) => c.id === picked);
  if (!ch) return (<div className="space-y-3"><h2 className="text-xl font-semibold">{situation.question}</h2>
    {situation.choices.map((c, i) => (<Button type="button" key={c.id} variant="outline" disabled={pending}
      style={{ ["--i" as string]: i }} aria-pressed={pending && sel === c.id}
      className={`vz-chip w-full h-auto whitespace-normal justify-start text-left py-3 gap-3 rounded-2xl border-2 border-b-4 transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent/40 active:translate-y-0.5 active:border-b-2 ${sel === c.id ? "border-primary bg-accent/60" : ""}`}
      onClick={() => { setSel(c.id); start(async () => { await answerAction(situation.id, c.id); setPicked(c.id); }); }}>
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl border-2 font-bold transition ${sel === c.id ? "border-primary bg-primary text-primary-foreground" : ""}`}>{String.fromCharCode(65 + i)}</span>{c.label}</Button>))}</div>);
  const ns = nextSteps[ch.nextStep]; const t = trails[ch.trail];
  return (<div className="relative space-y-4" aria-live="polite">
    <Confetti />
    <div className="flex items-center gap-3"><span className="vz-bounce flex size-16 items-center justify-center rounded-full bg-gradient-to-b from-[oklch(0.72_0.13_165)] to-primary text-3xl font-bold text-primary-foreground ring-4 ring-accent shadow-[0_5px_0_oklch(0.45_0.09_175)]">✓</span>
      <div><p className="text-xl font-bold">Situação concluída!</p><p className="vz-bounce mt-1 inline-block rounded-full bg-[oklch(0.95_0.07_95)] px-2.5 py-0.5 text-sm font-extrabold text-[oklch(0.42_0.09_80)]" style={{ animationDelay: "250ms" }}>⭐ +10 XP</p></div></div>
    <Card className="vz-chip border-primary/40 bg-accent/40" style={{ ["--i" as string]: 3 }}><CardHeader><CardTitle>Sua escolha</CardTitle><CardDescription>{ch.label}</CardDescription></CardHeader><CardContent><p>{ch.feedback}</p></CardContent></Card>
    <Card><CardHeader><CardTitle>Próximo passo: {ns.title}</CardTitle><CardDescription>{ns.desc}</CardDescription></CardHeader>
      <CardContent className="text-sm text-muted-foreground">Outras opções: conversar com alguém de confiança · UBS mais próxima · <strong>Disque Saúde 136</strong></CardContent></Card>
    <Card><CardHeader><CardTitle>Trilha sugerida: {t.title}</CardTitle><CardDescription>{t.desc}</CardDescription></CardHeader></Card>
    <div className="flex flex-wrap gap-3"><Link href="/aluno" className={buttonVariants()}>Continuar o caminho →</Link><Link href="/aluno/trilha" className={buttonVariants({ variant: "outline" })}>Ver mapa da trilha</Link><Button type="button" variant="ghost" onClick={() => setPicked(null)}>Escolher de novo</Button></div>
  </div>);
}
